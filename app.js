// 轻食食材数据库（每100g的热量）
const foodDatabase = {
    主食: [
        { id: 1, name: '糙米饭', calories: 111, unit: '100g', protein: 2.6, carbs: 24, fat: 0.8 },
        { id: 2, name: '全麦面包', calories: 246, unit: '100g', protein: 9, carbs: 48, fat: 3.4 },
        { id: 3, name: '燕麦', calories: 367, unit: '100g', protein: 12.5, carbs: 61, fat: 7.2 },
        { id: 4, name: '紫薯', calories: 82, unit: '100g', protein: 1.6, carbs: 18.3, fat: 0.2 },
        { id: 5, name: '玉米', calories: 112, unit: '100g', protein: 4, carbs: 23, fat: 1.2 },
    ],
    蛋白质: [
        { id: 11, name: '鸡胸肉', calories: 133, unit: '100g', protein: 24.6, carbs: 2.5, fat: 5 },
        { id: 12, name: '三文鱼', calories: 139, unit: '100g', protein: 20, carbs: 0, fat: 6.3 },
        { id: 13, name: '鸡蛋', calories: 144, unit: '100g', protein: 13.3, carbs: 2.8, fat: 8.8 },
        { id: 14, name: '豆腐', calories: 81, unit: '100g', protein: 8.1, carbs: 4.2, fat: 3.7 },
        { id: 15, name: '虾仁', calories: 87, unit: '100g', protein: 18.6, carbs: 2.8, fat: 0.6 },
    ],
    蔬菜: [
        { id: 21, name: '西兰花', calories: 36, unit: '100g', protein: 4.1, carbs: 4.9, fat: 0.6 },
        { id: 22, name: '生菜', calories: 13, unit: '100g', protein: 1.3, carbs: 2.1, fat: 0.3 },
        { id: 23, name: '番茄', calories: 15, unit: '100g', protein: 0.9, carbs: 3.3, fat: 0.2 },
        { id: 24, name: '黄瓜', calories: 15, unit: '100g', protein: 0.8, carbs: 3.6, fat: 0.1 },
        { id: 25, name: '胡萝卜', calories: 25, unit: '100g', protein: 1, carbs: 6, fat: 0.2 },
        { id: 26, name: '菠菜', calories: 28, unit: '100g', protein: 2.6, carbs: 4.5, fat: 0.3 },
    ],
    水果: [
        { id: 31, name: '苹果', calories: 54, unit: '100g', protein: 0.4, carbs: 13.8, fat: 0.2 },
        { id: 32, name: '香蕉', calories: 93, unit: '100g', protein: 1.4, carbs: 23, fat: 0.2 },
        { id: 33, name: '蓝莓', calories: 57, unit: '100g', protein: 0.7, carbs: 14.5, fat: 0.3 },
        { id: 34, name: '草莓', calories: 30, unit: '100g', protein: 1, carbs: 7.7, fat: 0.2 },
        { id: 35, name: '奇异果', calories: 56, unit: '100g', protein: 1.1, carbs: 14.7, fat: 0.5 },
    ],
    其他: [
        { id: 41, name: '牛油果', calories: 171, unit: '100g', protein: 2, carbs: 8.6, fat: 15.3 },
        { id: 42, name: '坚果(混合)', calories: 607, unit: '100g', protein: 20, carbs: 20, fat: 54 },
        { id: 43, name: '橄榄油', calories: 899, unit: '100g', protein: 0, carbs: 0, fat: 100 },
        { id: 44, name: '酸奶', calories: 72, unit: '100g', protein: 3.5, carbs: 5, fat: 3.3 },
    ]
};

// 主应用组件
function CalorieCalculator() {
    const [selectedFoods, setSelectedFoods] = React.useState([]);
    const [activeCategory, setActiveCategory] = React.useState('主食');

    // 添加食材到已选列表
    const addFood = (food) => {
        setSelectedFoods([...selectedFoods, { ...food, amount: 100, key: Date.now() }]);
    };

    // 移除食材
    const removeFood = (key) => {
        setSelectedFoods(selectedFoods.filter(f => f.key !== key));
    };

    // 更新食材份量
    const updateAmount = (key, amount) => {
        setSelectedFoods(selectedFoods.map(f => 
            f.key === key ? { ...f, amount: parseInt(amount) || 0 } : f
        ));
    };

    // 计算总营养
    const calculateTotals = () => {
        return selectedFoods.reduce((totals, food) => {
            const ratio = food.amount / 100;
            return {
                calories: totals.calories + (food.calories * ratio),
                protein: totals.protein + (food.protein * ratio),
                carbs: totals.carbs + (food.carbs * ratio),
                fat: totals.fat + (food.fat * ratio)
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const totals = calculateTotals();

    return (
        <div className="container">
            <h1 className="title">🥗 轻食热量计算器</h1>
            
            <div className="main-content">
                {/* 左侧：食材选择区 */}
                <div className="food-selection">
                    <h2>选择食材</h2>
                    
                    {/* 分类标签 */}
                    <div className="categories">
                        {Object.keys(foodDatabase).map(category => (
                            <button
                                key={category}
                                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* 食材列表 */}
                    <div className="food-list">
                        {foodDatabase[activeCategory].map(food => (
                            <div key={food.id} className="food-item">
                                <div className="food-info">
                                    <span className="food-name">{food.name}</span>
                                    <span className="food-calories">{food.calories} kcal/{food.unit}</span>
                                </div>
                                <button 
                                    className="add-btn"
                                    onClick={() => addFood(food)}
                                >
                                    ＋
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧：已选食材和结果 */}
                <div className="result-section">
                    <h2>我的轻食搭配</h2>
                    
                    {selectedFoods.length === 0 ? (
                        <div className="empty-state">
                            <p>🍽️</p>
                            <p>请从左侧选择食材开始搭配</p>
                        </div>
                    ) : (
                        <>
                            <div className="selected-foods">
                                {selectedFoods.map(food => (
                                    <div key={food.key} className="selected-item">
                                        <div className="selected-info">
                                            <span className="selected-name">{food.name}</span>
                                            <div className="amount-control">
                                                <input
                                                    type="number"
                                                    value={food.amount}
                                                    onChange={(e) => updateAmount(food.key, e.target.value)}
                                                    min="0"
                                                    step="10"
                                                    className="amount-input"
                                                />
                                                <span className="amount-unit">g</span>
                                            </div>
                                        </div>
                                        <div className="selected-details">
                                            <span className="detail-calories">
                                                {Math.round(food.calories * food.amount / 100)} kcal
                                            </span>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => removeFood(food.key)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 营养总计 */}
                            <div className="totals">
                                <h3>营养总计</h3>
                                <div className="total-row calories-row">
                                    <span className="total-label">总热量</span>
                                    <span className="total-value">{Math.round(totals.calories)} kcal</span>
                                </div>
                                <div className="nutrition-grid">
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">蛋白质</span>
                                        <span className="nutrition-value">{totals.protein.toFixed(1)}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">碳水</span>
                                        <span className="nutrition-value">{totals.carbs.toFixed(1)}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">脂肪</span>
                                        <span className="nutrition-value">{totals.fat.toFixed(1)}g</span>
                                    </div>
                                </div>
                                
                                {/* 健康建议 */}
                                <div className="health-tip">
                                    {totals.calories < 300 && <p>💡 热量偏低，建议增加主食或蛋白质</p>}
                                    {totals.calories >= 300 && totals.calories <= 600 && <p>✅ 热量适中，适合作为一餐</p>}
                                    {totals.calories > 600 && totals.calories <= 800 && <p>⚠️ 热量较高，注意控制</p>}
                                    {totals.calories > 800 && <p>🔴 热量过高，建议减少份量</p>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .container {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                }

                .title {
                    text-align: center;
                    color: #333;
                    margin-bottom: 32px;
                    font-size: 32px;
                    font-weight: 700;
                }

                .main-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                /* 食材选择区 */
                .food-selection h2,
                .result-section h2 {
                    font-size: 20px;
                    color: #333;
                    margin-bottom: 16px;
                    font-weight: 600;
                }

                .categories {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }

                .category-btn {
                    background: #f0f0f0;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                    font-weight: 500;
                }

                .category-btn:hover {
                    background: #e0e0e0;
                }

                .category-btn.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .food-list {
                    max-height: 500px;
                    overflow-y: auto;
                    padding-right: 8px;
                }

                .food-list::-webkit-scrollbar {
                    width: 6px;
                }

                .food-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .food-list::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }

                .food-list::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                .food-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 8px;
                    background: #f9f9f9;
                    border-radius: 12px;
                    transition: all 0.3s;
                }

                .food-item:hover {
                    background: #f0f0f0;
                    transform: translateX(4px);
                }

                .food-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .food-name {
                    font-weight: 500;
                    color: #333;
                }

                .food-calories {
                    font-size: 12px;
                    color: #666;
                }

                .add-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .add-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                /* 结果区 */
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #999;
                }

                .empty-state p:first-child {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .selected-foods {
                    max-height: 300px;
                    overflow-y: auto;
                    margin-bottom: 24px;
                    padding-right: 8px;
                }

                .selected-foods::-webkit-scrollbar {
                    width: 6px;
                }

                .selected-foods::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .selected-foods::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }

                .selected-item {
                    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                    padding: 12px;
                    border-radius: 12px;
                    margin-bottom: 12px;
                }

                .selected-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .selected-name {
                    font-weight: 500;
                    color: #333;
                }

                .amount-control {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .amount-input {
                    width: 70px;
                    padding: 4px 8px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    text-align: center;
                }

                .amount-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .amount-unit {
                    font-size: 14px;
                    color: #666;
                }

                .selected-details {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .detail-calories {
                    color: #667eea;
                    font-weight: 600;
                    font-size: 14px;
                }

                .remove-btn {
                    background: #ff4757;
                    color: white;
                    border: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .remove-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
                }

                /* 营养总计 */
                .totals {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 24px;
                    border-radius: 16px;
                    color: white;
                }

                .totals h3 {
                    margin-bottom: 16px;
                    font-size: 18px;
                    font-weight: 600;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .calories-row {
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .total-label {
                    font-size: 16px;
                }

                .total-value {
                    font-size: 28px;
                    font-weight: 700;
                }

                .nutrition-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .nutrition-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    border-radius: 12px;
                }

                .nutrition-label {
                    font-size: 12px;
                    opacity: 0.9;
                    margin-bottom: 4px;
                }

                .nutrition-value {
                    font-size: 18px;
                    font-weight: 600;
                }

                .health-tip {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 12px;
                    border-radius: 12px;
                    text-align: center;
                    font-size: 14px;
                }

                .health-tip p {
                    margin: 0;
                }

                /* 响应式设计 */
                @media (max-width: 768px) {
                    .main-content {
                        grid-template-columns: 1fr;
                    }

                    .container {
                        padding: 20px;
                    }

                    .title {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
}

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CalorieCalculator />);