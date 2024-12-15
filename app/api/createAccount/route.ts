/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Horizon,
} from "@stellar/stellar-sdk";
import { prisma } from "@/lib/auth";
import getSession from "@/lib/getuserSession";
// import server from "@/lib/stellarConfig";
export async function PUT(request: Request) {
  // master account that funds newly created accounts with one lumen for account activation

  const session = await getSession();

  if (!session) return new Response("unauthorized", { status: 401 });

  if (!process.env.MASTER_KEY) throw new Error("master key not provided");

  const masterKeypair = Keypair.fromSecret(process.env.MASTER_KEY);

  //   creating keypair for new account
  const newKeypair = Keypair.random();

  try {
    //   loading from stellar network
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const masterAccount = await server.loadAccount(masterKeypair.publicKey());

    const transaction = new TransactionBuilder(masterAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createAccount({
          destination: newKeypair.publicKey(),
          startingBalance: "2",
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(masterKeypair);
    console.log(transaction.toXDR());

    const res = await server.submitTransaction(transaction);

    if (!res) throw new Error("transaction failed account not created");

    const account = await prisma.account.findFirst({
      where: { userId: session?.session.userId },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    if (account.stellarAccount && account.stellar_Secret) {
      return new Response(
        JSON.stringify({ message: "Account already exists" }),
        { status: 401 }
      );
    }

    // Step 2: Update the stellarAccount property
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: {
        stellarAccount: newKeypair.publicKey(),
        stellar_Secret: newKeypair.secret(),
      },
    });

    console.log(`Transaction Successful! Hash: ${res.hash}`);
    return new Response(JSON.stringify(updatedAccount), { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    return new Response((error as Error)?.message, { status: 500 });
  }
}

export const GET = async function () {
  try {
    const session = await getSession();
    // console.log("session: ************", session, "*****************");
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const account = await prisma.account.findFirst({
      where: { userId: session.session.userId },
      include: {
        user: true,
      },
    });

    if (!account) {
      return new Response("Account not found", { status: 404 });
    }

    //here get the stellar account infos  from the stellar network (using stellarAccount column in account object )
    const AccountNumber = account.stellarAccount;

    if (!AccountNumber) {
      return new Response("No stellar account found", { status: 404 });
    }

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const accountInfos = await server.loadAccount(AccountNumber);

    console.log(
      "accountInfos: ************",
      accountInfos.balances,
      "*****************"
    );

    const fullAccount = {
      ...account,
      balances: accountInfos.balances,
    };

    // Return the combined data
    return new Response(JSON.stringify(fullAccount), {
      status: 200,
    });
  } catch (error: unknown) {
    console.log((error as Error).message);
    return new Response((error as Error).message, { status: 500 });
  }
};
