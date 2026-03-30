import { NextResponse } from 'next/server';

const FEATURED_USERS = [
  'torvalds',
  'yyx990803',
  'gaearon',
  'kentcdodds',
  'ryanholinshead',
  'taylorotwell',
  'dhh',
  'brendaneich',
  'guillermoraj',
  'addyosmani',
  'sindresorhus',
  'tj',
];

export const dynamic = 'force-dynamic';

export async function GET() {
  const randomUsers = FEATURED_USERS
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  return NextResponse.json(
    { 
      featured: randomUsers,
      total: FEATURED_USERS.length,
    },
    {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    }
  );
}
