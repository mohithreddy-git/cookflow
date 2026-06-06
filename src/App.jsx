import { useState } from 'react';
import DishIntake from './components/DishIntake';
import LanguageSelect from './components/LanguageSelect';
import CookingGuide from './components/CookingGuide';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('intake'); // 'intake' | 'language' | 'guide'
  const [dish, setDish] = useState('');
  const [language, setLanguage] = useState(null);

  function handleDishSubmit(dishName) {
    setDish(dishName);
    setScreen('language');
  }

  function handleLanguageSelect(lang) {
    setLanguage(lang);
    setScreen('guide');
  }

  function handleReset() {
    setScreen('intake');
    setDish('');
    setLanguage(null);
  }

  return (
    <div className="min-h-screen bg-cream font-body">
      {screen === 'intake' && (
        <DishIntake onSubmit={handleDishSubmit} />
      )}
      {screen === 'language' && (
        <LanguageSelect dish={dish} onSelect={handleLanguageSelect} onBack={() => setScreen('intake')} />
      )}
      {screen === 'guide' && (
        <CookingGuide dish={dish} language={language} onReset={handleReset} />
      )}
    </div>
  );
}
