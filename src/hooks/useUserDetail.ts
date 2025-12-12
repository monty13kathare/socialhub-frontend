import { useQuery } from "@tanstack/react-query";
import { getUserDetail } from "../api/user";

export function useUserDetail(targetId: string | null) {
    return useQuery({
        queryKey: ["user-detail", targetId],
        queryFn: () => getUserDetail(targetId!),
        enabled: !!targetId, // run only when ID exists
    });
}
