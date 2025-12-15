import {create} from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'

//定义每个景点
interface Place{
    name:string,
    description:string,
    image:string
}

//定义每天的行程
interface DayPlan{
    day:number,
    places:Place[]
}

//定义整个行程状态
interface TourismGuide{
    city:string,
    schedule:DayPlan[],
}

interface TourStore{
    tourismGuide:TourismGuide | null,
    city:string,
    setTourGuide:(guide:TourismGuide)=>void,
    setCity:(city:string)=>void,
}
// 进行本地持久化
const useTourStore = create<TourStore>()(
    persist(
        (set)=>{
            return{
                tourismGuide: null,
                city: '',
                setTourGuide: (guide) => set({ tourismGuide: guide }),
                setCity: (city) => set({ city }),
            }
        },
        {
            name:'tour-storage'
        }
    )
)
export default useTourStore;