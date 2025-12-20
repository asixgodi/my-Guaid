// app/xhs/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-24">
        <div className="text-center mb-12">
          {/* 模拟标题的骨架屏 */}
          <div className="h-12 w-3/4 bg-gray-300 rounded-lg mx-auto animate-pulse"></div>
          <div className="h-1 w-20 bg-gray-300 rounded-full mx-auto mt-4"></div>
        </div>
        
        {/* 模拟地图的骨架屏 */}
        <div className="mb-8 h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        
        {/* 模拟按钮的骨架屏 */}
        <div className="flex gap-4 pb-4 overflow-hidden">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
           ))}
        </div>
      </div>
    </div>
  );
}