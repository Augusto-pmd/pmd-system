"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.loginWrapper}>
      <LoginForm />
    </main>
  );
}

