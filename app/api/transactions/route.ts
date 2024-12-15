import { prisma } from "@/lib/auth";
import getSession from "@/lib/getuserSession";
import { Horizon } from "@stellar/stellar-sdk";

export const GET = async function () {
  try {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        stellarAccount: true,
      },
    });

    if (!account) return new Response("Account not found", { status: 404 });

    const AccountNumber = account.stellarAccount;

    if (!AccountNumber)
      return new Response("No Stellar account found", { status: 404 });

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const transactions = await server
      .transactions()
      .forAccount(AccountNumber)
      .limit(10)
      .call();

    const operationsPromises = transactions.records.map((tx) =>
      server.operations().forTransaction(tx.id).call()
    );

    const operationsResponses = await Promise.all(operationsPromises);
    const allOperations = operationsResponses.flatMap((res) => res.records);
    console.log(allOperations);

    return new Response(JSON.stringify({ records: allOperations }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response((error as Error).message, { status: 500 });
  }
};
