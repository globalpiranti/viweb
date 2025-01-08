import type { Context } from "../types/viweb";

export default function Welcome({ params, render }: Context) {
  return render("welcome");
}
