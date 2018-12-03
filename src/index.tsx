import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.scss'

const App = () => (
  <>
    <header>
      <h2>Enter a zip code to find some Hams!</h2>
    </header>
    <main>
      <h6>To narrow to Zip+4, omit the dash (e.g. 920563043)</h6>
      <HammerSearch />
    </main>
    <footer>
      <div>
        [ <a href="/about.html">about</a> ]
      </div>
    </footer>
  </>
)

interface Hammer {
  name: string
  calls: string[]
}

interface State {
  fetchError?: string
  inputError: boolean
  hammers?: Hammer[]
  value: string
}
class HammerSearch extends React.Component {
  public state: State = { inputError: false, value: '' }
  public render() {
    return (
      <>
        <form onSubmit={this.getEm}>
          <input
            value={this.state.value}
            onChange={(e) => this.setState({ value: e.currentTarget.value })}
          />
          <button>Search</button>
        </form>
        {(this.state.inputError || this.state.fetchError) && (
          <div className="errors">
            {this.state.fetchError}
            {this.state.inputError && "That's doesn't look like a zip code..."}
          </div>
        )}
        <div className="hammer-table">
          <table>
            <tbody>
              {this.state.hammers &&
                this.state.hammers.map((hammer) => (
                  <tr>
                    <td>{hammer.calls.join(', ')}</td>
                    <td>{hammer.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  private getEm = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (Number.isNaN(Number(this.state.value))) {
      this.setState({ inputError: true })
      return
    }

    this.setState({ inputError: false })
    let fetchError = 'Error fetching Hams :,('
    try {
      const res = await fetchHams(this.state.value)
      if (res.status === 200) {
        const hammers = await res.json()
        this.setState({ hammers, fetchError: undefined })
        return
      } else if (res.status === 429) {
        fetchError = 'Slow down, cowboy ;P'
      } else if (res.status === 422) {
        fetchError = (await res.json()).errMessage
      }
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error(err)
    }

    this.setState({ fetchError })
  }
}
ReactDOM.render(<App />, document.getElementById('root') as HTMLElement)

const fetchHams = async (zip: string) => {
  return fetch('/api', {
    body: JSON.stringify({ zip }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
}
