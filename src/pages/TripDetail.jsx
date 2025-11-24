// src/pages/TripDetail.jsx (局部修改：尋找渲染行程列表的部分)

// ... 其他代碼和導入 ...

// 這是渲染單個行程項目的部分
<Draggable draggableId={item.id} index={index} key={item.id}>
    {(provided, snapshot) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            // ******************************************************
            // 這是新增/修改的樣式邏輯：
            // 當 snapshot.isDragging 為 true 時，應用提升的樣式
            className={`
                bg-white dark:bg-gray-800 p-3 rounded-lg shadow 
                mb-3 transition-all duration-200 ease-in-out 
                ${snapshot.isDragging 
                    ? 'shadow-2xl border-2 border-indigo-500 transform scale-[1.02] rotate-1' 
                    : 'hover:shadow-lg' // 拖曳時應用明顯的陰影、邊框和輕微放大/旋轉
                }
            `}
            // ******************************************************
            onClick={() => handleEditItinerary(item)}
        >
            {/* ... 行程內容顯示（例如：時間、活動名稱等）... */}
        </div>
    )}
</Draggable>

// ... 

// 對 **費用項目** 執行相同的修改（如果它們也是可拖曳的）
// 找到渲染單個費用項目的地方 (假設其結構類似)
<Draggable draggableId={expense.id} index={index} key={expense.id}>
    {(provided, snapshot) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            // ******************************************************
            // 這是新增/修改的樣式邏輯：
            className={`
                bg-white dark:bg-gray-800 p-3 rounded-lg shadow 
                mb-3 transition-all duration-200 ease-in-out 
                ${snapshot.isDragging 
                    ? 'shadow-2xl border-2 border-red-500 transform scale-[1.02]' 
                    : 'hover:shadow-lg' // 費用使用不同的邊框顏色（例如紅色）
                }
            `}
            // ******************************************************
            onClick={() => handleEditExpense(expense)}
        >
            {/* ... 費用內容顯示 ... */}
        </div>
    )}
</Draggable>

// ... 其他代碼 ...
