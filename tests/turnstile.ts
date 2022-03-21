import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { createAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Turnstile } from "../target/types/turnstile";
const { SystemProgram } = anchor.web3;

describe("turnstile", async () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Turnstile as Program<Turnstile>;

  let pda: PublicKey = null;

  // The Accounts to create.
  const state = anchor.web3.Keypair.generate();
  const treasury = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  const mint = anchor.web3.Keypair.generate();

  let userTokenAccountMint: PublicKey = null;
  let userTokenAccount: PublicKey = null;

  it("Is initialized!", async () => {

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(payer.publicKey, 10000000000),
      "confirmed"
    );

        // Get the PDA that is assigned authority to token account.
        const [_pda, _nonce] = await PublicKey.findProgramAddress(
          [mint.publicKey.toBytes()],
          program.programId
        );

        pda = _pda;

    // Add your test here.
    await program.rpc.initialize({
      accounts: {
        mint: mint.publicKey,
        state: state.publicKey,
        user: payer.publicKey,
        mintAuthority: pda,
        treasury: treasury.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram:TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      },
      signers: [payer, mint, state],
    });

    let tokenMint = await program.account.state.fetch(state.publicKey);

    console.log("TokenMint: ", tokenMint.mint);

  });

  it("Exchange!", async () => {

    userTokenAccountMint = mint.publicKey;
    userTokenAccount = await createAccount(
      provider.connection,
      payer,
      userTokenAccountMint,
      payer.publicKey,
      );

    await program.rpc.exchange({
      accounts: {
        state: state.publicKey,
        userTokenAccount: userTokenAccount,
        user: payer.publicKey,
        mint: mint.publicKey,
        mintAuthority: pda,
        treasury: treasury.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      },
      signers: [payer],
    });
  });

  it("Coin!", async () => {
    await program.rpc.coin({
      accounts: {
        state: state.publicKey,
        userTokenAccount: userTokenAccount,
        user: payer.publicKey,
        mint: mint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [payer],
    });
  });

  it("Push!", async () => {

    await program.rpc.push({
      accounts: {
        state: state.publicKey,
        user:payer.publicKey,
      },
      signers: [payer],
    });
  });
});
