import type { Route } from "./+types/users";
import Users from "../users/Users";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Users | Airbnb Clone" },
    { name: "description", content: "Users page" },
  ];
}

export default Users;


