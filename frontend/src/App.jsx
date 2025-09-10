import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Card from './components/card/card.component'
import './components/card/card.styles.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <h1 >Hello World</h1>
      <div className='dashboard-container'>
        <h3 className='text-black'>Dashboard</h3>
        <div className='cards-grid'>
          <Card>
            <p>Total Pitches</p>
          </Card>

          <Card>
            <p>Total Views</p>
          </Card>

          <Card>
            <p>Most Viewed Pitch</p>
          </Card>
        </div>
      </div>

    </div>
    </>
  )
}

export default App
