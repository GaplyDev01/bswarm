// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createSolanaRpc } from '../../../lib/solana/v2';
import { logger } from '../../../lib/utils';

/**
 * GET handler for Solana API route
 * Used to retrieve basic Solana blockchain information
 */
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'blockhash';
  const address = request.nextUrl.searchParams.get('address');

  const rpc_url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

  if (!rpc_url) {
    return NextResponse.json({ error: 'Solana RPC URL not configured' }, { status: 500 });
  }

  try {
    const rpc = createSolanaRpc(rpc_url);

    switch (action) {
      case 'blockhash': {
        const { blockhash, lastValidBlockHeight } = await rpc.getLatestBlockhash().send();
        return NextResponse.json({ blockhash, lastValidBlockHeight });
      }

      case 'blockheight': {
        const blockheight = await rpc.getBlockHeight().send();
        return NextResponse.json({ blockheight });
      }

      case 'balance': {
        if (!address) {
          return NextResponse.json(
            { error: 'Address is required for balance action' },
            { status: 400 }
          );
        }

        try {
          new PublicKey(address); // Validate the address
        } catch (e) {
          return NextResponse.json({ error: 'Invalid Solana address' }, { status: 400 });
        }

        const balance = await rpc.getBalance(address).send();
        return NextResponse.json({ balance });
      }

      case 'health': {
        const health = await rpc.getHealth().send();
        return NextResponse.json({ health });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    logger.error('Error in Solana API route:', error);
    return NextResponse.json(
      {
        error: 'RPC error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for Solana API route
 * Used to fetch more complex data requiring parameters
 */
export async function POST(request: NextRequest) {
  const rpc_url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

  if (!rpc_url) {
    return NextResponse.json({ error: 'Solana RPC URL not configured' }, { status: 500 });
  }

  try {
    const rpc = createSolanaRpc(rpc_url);
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'tokenAccounts': {
        const { owner } = body;

        if (!owner) {
          return NextResponse.json({ error: 'Owner address is required' }, { status: 400 });
        }

        try {
          new PublicKey(owner); // Validate the owner address
        } catch (e) {
          return NextResponse.json({ error: 'Invalid owner address' }, { status: 400 });
        }

        // Using TOKEN_PROGRAM_ID from Solana
        const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

        const accounts = await rpc
          .getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
          .send();
        return NextResponse.json({ accounts });
      }

      case 'transaction': {
        const { signature } = body;

        if (!signature) {
          return NextResponse.json({ error: 'Transaction signature is required' }, { status: 400 });
        }

        const transaction = await rpc
          .getTransaction(signature, { maxSupportedTransactionVersion: 0 })
          .send();
        return NextResponse.json({ transaction });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    logger.error('Error in Solana API POST:', error);
    return NextResponse.json(
      {
        error: 'RPC error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
