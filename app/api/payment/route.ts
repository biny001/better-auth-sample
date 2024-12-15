import {
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
  Horizon,
  Asset,
} from "@stellar/stellar-sdk";

import { prisma } from "@/lib/auth";
import getSession from "@/lib/getuserSession";

// POST/ api/payment
export const POST = async function (request: Request) {
  try {
    const body = await request.json();
    if (!body) {
      throw new Error("Invalid request body");
    }
    const { recipientAddress, amountSent } = body;

    //here we will transfer from the user account to the another account (the owner of the app)
    const session = await getSession();
    if (!session) {
      return new Response("unauthorized", { status: 401 });
    }

    //which is the public and secretkey of stellar account related to session user
    const stellarAccountInfos = await prisma.account.findFirst({
      where: { userId: session.session.userId },
      select: {
        stellarAccount: true, // Load the stellar account public key
        stellar_Secret: true,
      },
    });

    if (
      !stellarAccountInfos?.stellar_Secret ||
      !stellarAccountInfos?.stellarAccount
    ) {
      return new Response("no stellar account found", { status: 404 });
    }

    //payer keypair
    const userKeyPair = Keypair.fromSecret(stellarAccountInfos?.stellar_Secret);

    if (!process.env.MASTER_KEY) {
      return new Response("Master account secret not configured", {
        status: 500,
      });
    }

    //destination keypair
    // const MASTER_KEY = process.env.MASTER_KEY;
    // const masterKeypair = Keypair.fromSecret(MASTER_KEY);

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const userAccount = await server.loadAccount(userKeyPair.publicKey());

    const transaction = new TransactionBuilder(userAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipientAddress,
          asset: Asset.native(),
          amount: amountSent,
        })
      )
      .setTimeout(30)
      .build();

    //sign the transaction (the signer is the payer)
    transaction.sign(userKeyPair);

    const res = await server.submitTransaction(transaction);
    console.log(`Transaction Successful! Hash: ${res.hash}`);

    //save to database

    return new Response(null, { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response((error as Error).message, { status: 500 });
  }
};
