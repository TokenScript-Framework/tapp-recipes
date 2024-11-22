import axios from "axios";
import { NEXT_PUBLIC_BACKEND_BASE } from "./constants";

const axiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_BACKEND_BASE,
});

export async function verifyAuth(type: string | null, accessToken: string) {
  return axiosInstance
    .get(`/auth/verify/${type}?accessToken=${accessToken}`)
    .then((v) => v.data);
}
