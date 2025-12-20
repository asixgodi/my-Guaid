import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useTourStore from "@/app/store/useTourStore";

export function useItinerary(userId: string) {
  const router = useRouter();
  const { setTourGuide, setCity } = useTourStore();
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [xhsNotes, setXhsNotes] = useState<any[]>([]);
    // 获取用户行程列表
    const fetchItineraries = useCallback(async()=>{
        if(!userId) return
        setLoading(true)
        try{  
          const res = await fetch(`/api/itinerary/list`)
          if (!res.ok) throw new Error("获取行程数据失败");
          const data = await res.json();
          setItineraries(data);
        }catch(error){
          console.error('Failed to fetch itineraries:',error)
        }finally{
          setLoading(false)
        }
      },[userId])

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

    //获取用户小红书行程
      const fetchXhsNotes = useCallback(async()=>{
        if(!userId) return
        try{
          const res = await fetch('/api/xhs/notes')
          if(!res.ok) throw new Error('获取小红书笔记失败')
          const data = await res.json()
          setXhsNotes(data)
        }catch(error){
          console.error('获取小红书笔记失败:',error)
        }
      },[userId])

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
    fetchItineraries,
    deleteItinerary,
    xhsNotes,
    fetchXhsNotes,
    deleteXhsNote,
    goToDetail,
    goToXhsDetail,
  };
}