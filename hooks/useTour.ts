import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useTourStore from "@/app/store/useTourStore";

export function useItinerary(userId: string,initialItineraries: any[] = [], initialXhsNotes: any[] = []) {
  const router = useRouter();
  const { setTourGuide, setCity } = useTourStore();
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState(initialItineraries);
  const [xhsNotes, setXhsNotes] = useState(initialXhsNotes);
    
      // 删除用户行程
        const deleteItinerary = useCallback(async(id:string,e:React.MouseEvent)=>{
           e.stopPropagation();
           if (!confirm("确定要删除这个行程吗？")) return;
            try {
              const response = await fetch(`/api/itinerary/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
              });
              if (!response.ok) throw new Error("删除行程失败");
                setItineraries((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              console.error("删除行程失败:", error);
              alert("删除行程失败，请稍后重试");
            }
    },[])


      // 删除小红书笔记
      const deleteXhsNote = useCallback(async(id:string,e:React.MouseEvent)=>{
          e.stopPropagation();
          if (!confirm("确定要删除这个小红书笔记吗？")) return;
      
          try {
            const response = await fetch(`/api/xhs/${id}`, {
              method: "DELETE",
            });
      
            if (!response.ok) throw new Error("删除小红书笔记失败");
            setXhsNotes((prev) => prev.filter((item) => item.id !== id));
          } catch (error) {
            console.error("删除小红书笔记失败:", error);
            alert("删除小红书笔记失败，请稍后重试");
          }
        },[])

  // 跳转行程详情页
  const goToDetail = useCallback((item: any) => {
    setTourGuide({ city: item.city, schedule: item.schedule });
    setCity(item.city);
    router.push("/touronceplan");
  }, [router, setTourGuide, setCity]);

  // 点击小红书笔记跳转到详情页
  const goToXhsDetail = useCallback((id: any) => {
    router.push(`/xhstour?noteId=${id}`); // 跳转到小红书详情页
  }, [router]);

  return {
    itineraries,
    loading,
    deleteItinerary,
    xhsNotes,
    deleteXhsNote,
    goToDetail,
    goToXhsDetail,
  };
}