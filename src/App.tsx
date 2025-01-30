import React, { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Minus, Plus } from 'lucide-react';

// Constants
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const PASTEL_COLORS = [
  'bg-pink-400/5', 'bg-yellow-400/5', 'bg-purple-400/5', 
  'bg-teal-400/5', 'bg-orange-400/5', 'bg-indigo-400/5', 'bg-gray-400/5'
];

// Date Utils
interface WeekInfo {
  year: number;
  month: number;
  weekNumber: number;
}

interface CountDaysInMonth {
  [key: string]: number;
}

const dateUtils = {
  getWeekInfo: (date: Date): WeekInfo => {
    // 해당 날짜가 속한 주의 첫째 날(월요일)을 구합니다
    const mondayOfWeek = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    mondayOfWeek.setDate(diff);

    // 그 주가 더 많은 날짜를 포함하는 월을 기준으로 정합니다
    const countDaysInMonth = Array(7).fill().map((_, i) => {
      const d = new Date(mondayOfWeek);
      d.setDate(mondayOfWeek.getDate() + i);
      return {
        month: d.getMonth() + 1,
        year: d.getFullYear()
      };
    }).reduce((acc, curr) => {
      const key = `${curr.year}-${curr.month}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // 가장 많은 날짜를 포함하는 월을 찾습니다
    const primaryMonth = Object.entries(countDaysInMonth)
      .sort((a, b) => b[1] - a[1])[0][0]
      .split('-')
      .map(Number);

    // 주차를 계산합니다
    const firstDayOfMonth = new Date(primaryMonth[0], primaryMonth[1] - 1, 1);
    const firstMondayOfMonth = new Date(firstDayOfMonth);
    firstMondayOfMonth.setDate(1 + (8 - firstDayOfMonth.getDay()) % 7);
    
    const weekNumber = Math.ceil((mondayOfWeek.getDate() - firstMondayOfMonth.getDate() + 1) / 7) + 
      (mondayOfWeek < firstMondayOfMonth ? 1 : 0);

    return {
      year: primaryMonth[0],
      month: primaryMonth[1],
      weekNumber
    };
  },
  
  getWeekDates: (year: number, month: number, weekNumber: number): Date[] => {
    // 해당 월의 1일을 기준으로 첫 월요일을 찾습니다
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstMondayOfMonth = new Date(firstDayOfMonth);
    firstMondayOfMonth.setDate(1 + (8 - firstDayOfMonth.getDay()) % 7);
    
    // 주차에 해당하는 월요일을 찾습니다
    const targetMonday = new Date(firstMondayOfMonth);
    targetMonday.setDate(firstMondayOfMonth.getDate() + (weekNumber - 1) * 7);
    
    // 해당 주의 7일을 반환합니다
    return Array(7).fill().map((_, i) => {
      const date = new Date(targetMonday);
      date.setDate(targetMonday.getDate() + i);
      return date;
    });
  },

  formatDate: (date: Date): string => {
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  },

  generateStateKey: (year: number, month: number, week: number): string => {
    return `${year}-${month}-${week}`;
  }
};

// Components remain the same...
const TodoItem = React.memo(({ todo, onToggle, onChange, onRemove }) => (
  <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-2">
    <input
      type="checkbox"
      checked={todo.checked}
      onChange={onToggle}
      className="w-4 h-4 rounded-full accent-yellow-400"
    />
    <input
      type="text"
      value={todo.text}
      onChange={onChange}
      placeholder="New todo..."
      className="w-full h-9 bg-gray-700/50 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-0 focus:outline-none border-none text-sm"
    />
    <button onClick={onRemove} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
      <Minus size={16} className="text-gray-400" />
    </button>
  </div>
));

const TodoList = React.memo(({ 
  day, 
  todos, 
  memo, 
  insight,
  onTodoToggle, 
  onTodoChange, 
  onTodoRemove, 
  onTodoAdd, 
  onMemoChange,
  onInsightChange 
}: TodoListProps) => (
  <div className="space-y-2">
    {todos.map((todo) => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onToggle={() => onTodoToggle(day, todo.id)}
        onChange={(e) => onTodoChange(day, todo.id, e.target.value)}
        onRemove={() => onTodoRemove(day, todo.id)}
      />
    ))}
    {todos.length < 10 && (
      <button
        onClick={() => onTodoAdd(day)}
        className="w-full p-2 flex items-center justify-center space-x-1 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
      >
        <Plus size={16} />
        <span>Add Todo</span>
      </button>
    )}
    <textarea
      value={memo}
      onChange={(e) => onMemoChange(day, e.target.value)}
      placeholder="Daily memo..."
      className="w-full h-20 mt-4 bg-gray-800/50 rounded-xl p-2 text-white placeholder-gray-500 focus:ring-0 focus:outline-none border-none"
    />
    <textarea
      value={insight}
      onChange={(e) => onInsightChange(day, e.target.value)}
      placeholder="Daily insights..."
      className="w-full h-32 mt-4 bg-gray-800/50 rounded-xl p-2 text-white placeholder-gray-500 focus:ring-0 focus:outline-none border-none"
    />
  </div>
));

// Navigation components remain the same...
const NavigationIcon = {
  Left: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  Right: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ),
  Today: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  )
};

const DateNavigator = React.memo(({ weekNumber, weekDates, onPrev, onNext, onToday }: DateNavigatorProps) => (
  <div className="flex items-center justify-between space-x-4 bg-gray-700/50 p-4 rounded-xl">
    <div className="flex items-center space-x-4">
      <button onClick={onPrev} className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors">
        <NavigationIcon.Left />
      </button>
      <span className="text-xl font-bold tracking-tight text-white">{weekNumber}주차</span>
      <button onClick={onNext} className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors">
        <NavigationIcon.Right />
      </button>
    </div>
    
    <div className="text-sm text-gray-300">
      {`${dateUtils.formatDate(weekDates[0])}(${FULL_DAYS[0]}) ~ ${dateUtils.formatDate(weekDates[6])}(${FULL_DAYS[6]})`}
    </div>

    <button
      onClick={onToday}
      className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors text-gray-300"
      title="오늘 날짜로 이동"
    >
      <NavigationIcon.Today />
    </button>
  </div>
));

const HabitTracker = React.memo(({ habits, onNameChange, onCheckChange, onAdd, onRemove }: HabitTrackerProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-9 gap-2">
      <div className="col-span-2 text-lg font-bold text-white self-end pb-1">HABITS</div>
      <div className="col-span-7 grid grid-cols-7 gap-2">
        {DAYS.map((day, index) => (
          <div key={index} className="text-center font-bold text-white text-xs">{day}</div>
        ))}
      </div>
    </div>
    {habits.map(({ name, checks }, index) => (
      <div key={index} className="grid grid-cols-9 gap-2 items-center">
        <div className="col-span-2 flex space-x-2">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(index, e.target.value)}
            placeholder="New habit..."
            className="w-full h-9 bg-gray-700/50 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-0 focus:outline-none border-none"
          />
          <button onClick={() => onRemove(index)} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
            <Minus size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="col-span-7 flex gap-2">
          {checks.map((checked, dayIndex) => (
            <div key={dayIndex} className="flex justify-center w-full">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckChange(index, dayIndex, e.target.checked)}
                className="w-5 h-5 rounded-full accent-yellow-400"
              />
            </div>
          ))}
        </div>
      </div>
    ))}
    {habits.length < 10 && (
      <button onClick={onAdd} className="w-full p-2 flex items-center justify-center space-x-1 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
        <Plus size={16} />
        <span>Add Habit</span>
      </button>
    )}
  </div>
));

const WeeklyPlanner = () => {
  // Date-related state
  const today = new Date();
  const initialWeekInfo = dateUtils.getWeekInfo(today);
  const [selectedYear, setSelectedYear] = useState(initialWeekInfo.year);
  const [selectedMonth, setSelectedMonth] = useState(initialWeekInfo.month);
  const [weekNumber, setWeekNumber] = useState(initialWeekInfo.weekNumber);
  
  // UI state
  const [selectedDay, setSelectedDay] = useState(FULL_DAYS[0]);

  // Create state management with period keys
  const createInitialPeriodState = (): PeriodsState => {
    const initialState = {};
    const currentKey = dateUtils.generateStateKey(selectedYear, selectedMonth, weekNumber);
    
    initialState[currentKey] = {
      habits: Array(1).fill().map(() => ({ name: '', checks: Array(7).fill(false) })),
      todos: FULL_DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: Array(1).fill().map(() => ({ id: crypto.randomUUID(), checked: false, text: '' }))
      }), {}),
      memos: FULL_DAYS.reduce((acc, day) => ({ ...acc, [day]: '' }), {}),
      insights: FULL_DAYS.reduce((acc, day) => ({ ...acc, [day]: '' }), {})
    };
    
    return initialState;
  };

  interface Todo {
  id: string;
  checked: boolean;
  text: string;
}

interface Habit {
  name: string;
  checks: boolean[];
}

interface PeriodData {
  habits: Habit[];
  todos: {
    [key: string]: Todo[];
  };
  memos: {
    [key: string]: string;
  };
  insights: {
    [key: string]: string;
  };
}

interface PeriodsState {
  [key: string]: PeriodData;
}

const [periodData, setPeriodData] = useState<PeriodsState>(createInitialPeriodState());

  // Get current period key and data
  const currentPeriodKey = dateUtils.generateStateKey(selectedYear, selectedMonth, weekNumber);
  const currentPeriodData = periodData[currentPeriodKey] || createInitialPeriodState()[currentPeriodKey];

  // Navigation handlers
  const navigate = {
    prev: () => {
      const currentDate = dateUtils.getWeekDates(selectedYear, selectedMonth, weekNumber)[0];
      const prevWeekDate = new Date(currentDate);
      prevWeekDate.setDate(currentDate.getDate() - 7);
      
      const weekInfo = dateUtils.getWeekInfo(prevWeekDate);
      setSelectedYear(weekInfo.year);
      setSelectedMonth(weekInfo.month);
      setWeekNumber(weekInfo.weekNumber);
    },
    next: () => {
      const currentDate = dateUtils.getWeekDates(selectedYear, selectedMonth, weekNumber)[0];
      const nextWeekDate = new Date(currentDate);
      nextWeekDate.setDate(currentDate.getDate() + 7);
      
      const weekInfo = dateUtils.getWeekInfo(nextWeekDate);
      setSelectedYear(weekInfo.year);
      setSelectedMonth(weekInfo.month);
      setWeekNumber(weekInfo.weekNumber);
    },
    today: () => {
      const weekInfo = dateUtils.getWeekInfo(new Date());
      setSelectedYear(weekInfo.year);
      setSelectedMonth(weekInfo.month);
      setWeekNumber(weekInfo.weekNumber);
    }
  };

  // Update handlers with period state management
  const updatePeriodData = (updates) => {
    setPeriodData(prev => ({
      ...prev,
      [currentPeriodKey]: {
        ...currentPeriodData,
        ...updates
      }
    }));
  };

  // Todo handlers
  const todoHandlers = {
    addTodo: (day) => {
      if (currentPeriodData.todos[day].length < 10) {
        updatePeriodData({
          todos: {
            ...currentPeriodData.todos,
            [day]: [...currentPeriodData.todos[day], { id: crypto.randomUUID(), checked: false, text: '' }]
          }
        });
      }
    },
    removeTodo: (day, todoId) => {
      updatePeriodData({
        todos: {
          ...currentPeriodData.todos,
          [day]: currentPeriodData.todos[day].filter(todo => todo.id !== todoId)
        }
      });
    },
    toggleTodo: (day, todoId) => {
      updatePeriodData({
        todos: {
          ...currentPeriodData.todos,
          [day]: currentPeriodData.todos[day].map(todo =>
            todo.id === todoId ? { ...todo, checked: !todo.checked } : todo
          )
        }
      });
    },
    changeTodoText: (day, todoId, text) => {
      updatePeriodData({
        todos: {
          ...currentPeriodData.todos,
          [day]: currentPeriodData.todos[day].map(todo =>
            todo.id === todoId ? { ...todo, text } : todo
          )
        }
      });
    },
    changeMemo: (day, text) => {
      updatePeriodData({
        memos: {
          ...currentPeriodData.memos,
          [day]: text
        }
      });
    },
    changeInsight: (day, text) => {
      updatePeriodData({
        insights: {
          ...currentPeriodData.insights,
          [day]: text
        }
      });
    }
  };

  // Habit handlers
  const habitHandlers = {
    addHabit: () => {
      if (currentPeriodData.habits.length < 10) {
        updatePeriodData({
          habits: [...currentPeriodData.habits, { name: '', checks: Array(7).fill(false) }]
        });
      }
    },
    removeHabit: (index) => {
      updatePeriodData({
        habits: currentPeriodData.habits.filter((_, i) => i !== index)
      });
    },
    changeName: (index, name) => {
      updatePeriodData({
        habits: currentPeriodData.habits.map((habit, i) => 
          i === index ? { ...habit, name } : habit
        )
      });
    },
    toggleCheck: (index, dayIndex, checked) => {
      updatePeriodData({
        habits: currentPeriodData.habits.map((habit, i) => 
          i === index 
            ? { ...habit, checks: habit.checks.map((c, j) => j === dayIndex ? checked : c) }
            : habit
        )
      });
    }
  };

  const weekDates = dateUtils.getWeekDates(selectedYear, selectedMonth, weekNumber);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Month Selection */}
        <Card className="bg-gray-800 border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-4 md:p-6 space-y-6">
            <div className="flex gap-2 overflow-x-auto">
              {MONTHS.map(month => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`w-12 h-8 rounded-xl font-bold text-base flex items-center justify-center
                    ${selectedMonth === month ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                >
                  {month}
                </button>
              ))}
            </div>
            <DateNavigator
              weekNumber={weekNumber}
              weekDates={weekDates}
              onPrev={navigate.prev}
              onNext={navigate.next}
              onToday={navigate.today}
            />
          </CardContent>
        </Card>

        {/* Daily Todo Lists - Desktop */}
        <div className="hidden md:grid md:grid-cols-7 gap-2">
          {FULL_DAYS.map((day, idx) => (
            <Card key={day} className={`${PASTEL_COLORS[idx]} bg-opacity-10 border-0 rounded-2xl overflow-hidden`}>
              <CardContent className="p-4 md:p-6">
                <div className="text-xl font-bold text-center mb-4 text-white">{day}</div>
                <TodoList
                  day={day}
                  todos={currentPeriodData.todos[day]}
                  memo={currentPeriodData.memos[day]}
                  insight={currentPeriodData.insights[day]}
                  onTodoToggle={todoHandlers.toggleTodo}
                  onTodoChange={todoHandlers.changeTodoText}
                  onTodoRemove={todoHandlers.removeTodo}
                  onTodoAdd={todoHandlers.addTodo}
                  onMemoChange={todoHandlers.changeMemo}
                  onInsightChange={todoHandlers.changeInsight}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Todo Lists - Mobile */}
        <div className="md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FULL_DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold ${
                  selectedDay === day 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-gray-700 text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <Card className={`${PASTEL_COLORS[FULL_DAYS.indexOf(selectedDay)]} bg-opacity-10 border-0 rounded-2xl overflow-hidden mt-2`}>
            <CardContent className="p-4 md:p-6">
              <TodoList
                day={selectedDay}
                todos={currentPeriodData.todos[selectedDay]}
                memo={currentPeriodData.memos[selectedDay]}
                insight={currentPeriodData.insights[selectedDay]}
                onTodoToggle={todoHandlers.toggleTodo}
                onTodoChange={todoHandlers.changeTodoText}
                onTodoRemove={todoHandlers.removeTodo}
                onTodoAdd={todoHandlers.addTodo}
                onMemoChange={todoHandlers.changeMemo}
                onInsightChange={todoHandlers.changeInsight}
              />
            </CardContent>
          </Card>
        </div>

        {/* Habit Tracker */}
        <Card className="bg-gray-800 border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <HabitTracker
              habits={currentPeriodData.habits}
              onNameChange={habitHandlers.changeName}
              onCheckChange={habitHandlers.toggleCheck}
              onAdd={habitHandlers.addHabit}
              onRemove={habitHandlers.removeHabit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyPlanner;