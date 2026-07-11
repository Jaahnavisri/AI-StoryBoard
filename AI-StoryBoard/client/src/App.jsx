import { Tabs } from './components/Tabs/Tabs.jsx';
import { Board } from './components/Board/Board.jsx';
import { Backlog } from './components/Backlog/Backlog.jsx';
import { StoryGenerator } from './components/StoryGenerator/StoryGenerator.jsx';
import { useBoard } from './context/BoardContext.jsx';
import './App.css';

const TABS = [
  { id: 'board', label: 'Board' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'generate', label: 'Generate' }
];

export default function App() {
  const { connectedClients } = useBoard();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Storyflow</h1>
          <p className="subtitle">AI-assisted story board</p>
        </div>
        <div className="presence">
          <span className="presence-dot" />
          {connectedClients} online
        </div>
      </header>

      <Tabs tabs={TABS} initialId="board">
        {(activeId) => {
          if (activeId === 'board') return <Board />;
          if (activeId === 'backlog') return <Backlog />;
          if (activeId === 'generate') return <StoryGenerator />;
          return null;
        }}
      </Tabs>
    </div>
  );
}
