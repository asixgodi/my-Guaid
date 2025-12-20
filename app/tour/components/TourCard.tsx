import { memo } from "react";
import { Trash2 } from "lucide-react";
/* eslint-disable @next/next/no-img-element */
interface TourCardProps{
  image?:string,
  title:string,
  subtitle1:string,
  subtitle2:string,
  onClick:()=>void,
  onDelete:(e:React.MouseEvent)=>void,
  deleteLabel:string
}
export const TourCard = memo((props: TourCardProps) => {
  return (
    <div
      className="relative rounded-xl overflow-hidden bg-white shadow-lg mb-6 cursor-pointer"
      onClick={props.onClick}
    >
      <img
        src={props.image}
        alt={props.title}
        className="w-full h-auto transform transition-transform duration-300 hover:scale-103"
        referrerPolicy="no-referrer"
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">{props.title}</h2>
          <button
            onClick={props.onDelete}
            className="text-red-500 hover:text-red-700 transition-colors"
            title={props.deleteLabel}
            aria-label={props.deleteLabel}
          >
            <Trash2 size={18} />
          </button>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{props.subtitle1}</span>
          <span>{props.subtitle2}</span>
        </div>
      </div>
    </div>
  );
});

TourCard.displayName = "TourCard";
