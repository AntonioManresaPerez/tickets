import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const authed = await isValid(token);
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/login";

  if (!authed && !isLogin) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

// Protege todo salvo los endpoints de auth y los recursos estáticos.
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
