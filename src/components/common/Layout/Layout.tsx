import type { ReactNode } from "react"
import NavBar from "../NavBar/NavBar"
import "./Layout.css"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <NavBar />
      <main className="layout-main">{children}</main>
    </>
  )
}
