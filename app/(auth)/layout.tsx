import React, { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const Layout = async ({ children }: { children: ReactNode }) => {
  // look for active user session if exist we will never be able to see auth again till sign out
  const session = await auth();

  if (session) redirect("/");
  return (
    <main className="auth-container">
      <section className="auth-form">
        <div className="auth-box">
          <div className="flex flex-row gap-5">
            <Image
              alt="logo"
              loading="lazy"
              width="37"
              height="37"
              decoding="async"
              src="/icons/logo.svg"
            />
            <h1 className="text-2xl font-semibold text-white">BookWise</h1>
          </div>
          <div> {children} </div>
        </div>
      </section>
      <section className="auth-illustration">
        <Image
          src="/images/auth-illustration.png"
          alt="auth_illustration"
          width={1000}
          height={1000}
          className="size-full object-cover"
        />
      </section>
    </main>
  );
};
export default Layout;
