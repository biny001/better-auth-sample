"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveUpRight } from "lucide-react";
import { MoveDownLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AccountData {
  user: {
    name: string;
    image?: string;
  };
  stellarAccount: string;
  balances: Array<{
    asset_type: string;
    balance: string;
  }>;
}

interface StellarOperation {
  id: string;
  type: string;
  amount?: string;
  asset_type?: string;
  created_at: string;
  from?: string;
  to?: string;
  funder?: string;
  account?: string;
  starting_balance?: string;
  transaction_hash: string;
  transaction_successful: boolean;
  source_account: string;
}

export function UserWallet() {
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [isHistory, setisHistory] = useState(true);
  const [operations, setOperations] = useState<{ records: StellarOperation[] }>(
    {
      records: [],
    }
  );
  function shortenAddress(address: string | undefined): string {
    if (!address) return "Unknown Address";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  useEffect(() => {
    async function getAccountInfos() {
      try {
        const res = await fetch("/api/createAccount");
        if (!res.ok) throw new Error("Failed to fetch account information");
        const data = await res.json();
        setAccountData(data);
      } catch (error) {
        console.error("Error fetching account data:", error);
        // You might want to set an error state here and display it to the user
      } finally {
        setIsLoading(false);
      }
    }
    getAccountInfos();
  }, []);

  useEffect(() => {
    async function getTransactions() {
      setisHistory(true);
      try {
        // First get the account address

        // Then get transactions
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setOperations(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setisHistory(false);
      }
    }
    getTransactions();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accountData?.stellarAccount || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address:", err);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to process the transfer
    try {
      setTransactionLoading(true);
      const paymentData = {
        recipientAddress: transferAddress,
        amountSent: transferAmount,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = await fetch("/api/payment", {
        method: "POST",
        body: JSON.stringify(paymentData),
        headers: { "Content-Type": "application/json" },
      });

      // Reset form after submission
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    } finally {
      setTransferAmount("");
      setTransferAddress("");
      setTransactionLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        {isLoading ? (
          <Skeleton className="w-16 h-16 rounded-full" />
        ) : (
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={accountData?.user.image}
              alt={accountData?.user.name || "User avatar"}
            />
            <AvatarFallback>
              {accountData?.user.name
                ? accountData?.user.name.charAt(0).toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-5 w-40" />
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">
                {accountData?.user.name}
              </CardTitle>
              <Badge
                onClick={copyToClipboard}
                variant="secondary"
                className="mt-1 flex items-center justify-between gap-x-1 cursor-pointer"
              >
                <span className="font-light w-28 overflow-hidden text-neutral-600">
                  {accountData?.stellarAccount}
                </span>
                {copied ? (
                  <Check className="w-3 h-3 text-slate-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-200" />
                )}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <div className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <TabsContent value="main" className="space-y-4 p-4">
              <div className="flex items-center h-16 justify-between">
                <span className="font-semibold">Balance:</span>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : showBalance ? (
                    <>
                      <span>
                        {accountData?.balances.map((balance, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-muted p-2 rounded-md mb-2"
                          >
                            <p className="text-sm flex items-center">
                              {balance.asset_type === "native" ? (
                                <span className="text-green-300 mr-2">xlm</span>
                              ) : (
                                <span>{balance.asset_type}</span>
                              )}
                            </p>
                            <span className="text-sm">{balance.balance}</span>
                          </div>
                        ))}
                      </span>
                      <EyeOff
                        className="w-5 h-5 text-muted-foreground cursor-pointer"
                        onClick={() => setShowBalance(false)}
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span>****</span>
                        <Eye
                          className="w-5 h-5 text-muted-foreground cursor-pointer"
                          onClick={() => setShowBalance(true)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="transfer" className="p-4">
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferAddress">
                    Recipient Wallet Address
                  </Label>
                  <Input
                    id="transferAddress"
                    placeholder="Enter wallet address"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount to Send</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button
                  disabled={transactionLoading}
                  type="submit"
                  className="w-full"
                >
                  Transfer
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="transactions" className="p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                {isHistory ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-muted p-3 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  operations.records.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`bg-muted p-3 rounded-lg space-y-2 ${
                        transaction.type === "create_account" ? "hidden" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-medium flex items-center ${
                            transaction.from === accountData?.stellarAccount
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {transaction.from === accountData?.stellarAccount ? (
                            <MoveUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <MoveDownLeft className="w-3 h-3 mr-1" />
                          )}
                          {transaction.amount}{" "}
                          {transaction.asset_type === "native"
                            ? "XLM"
                            : transaction.asset_type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>
                          From:{" "}
                          {transaction.from === accountData?.stellarAccount
                            ? "Wallet"
                            : shortenAddress(transaction.from)}
                        </p>
                        <p>
                          To:{" "}
                          {transaction.to === accountData?.stellarAccount
                            ? "Wallet"
                            : shortenAddress(transaction.to)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
