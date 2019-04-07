import { HamsNearMeLocation, trackPageview } from '@bartlett705/charcoal-client'
import * as React from 'react'
import './index.scss'

declare var window: Window & {
  testing: boolean
}

export const App = () => (
  <>
    <header>
      <h2>Enter a zip code to find some Hams!</h2>
    </header>
    <main>
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
  working: boolean
  inputValue: string
}
class HammerSearch extends React.Component {
  public state: State = { inputError: false, inputValue: '', working: false }
  public componentDidMount() {
    trackPageview({ location: HamsNearMeLocation.Front })
  }

  public render() {
    return (
      <>
        <form onSubmit={this.getEm}>
          <label>
            Zip Code
            <input
              value={this.state.inputValue}
              type="search"
              onChange={(e) =>
                this.setState({ inputValue: e.currentTarget.value })
              }
              // pattern="\d{9}"
            />
          </label>
          <button>Search</button>
        </form>
        <h6>To narrow to Zip+4, omit the dash! (e.g. 208925716)</h6>

        {(this.state.inputError || this.state.fetchError) && (
          <div className="errors">
            {this.state.fetchError}
            {this.state.inputError && "That doesn't look like a zip code 🤷‍♂"}
          </div>
        )}
        {this.state.working && (
          <span role="img" className="loading">
            📻
          </span>
        )}
        {this.state.hammers &&
          (this.state.hammers.length ? (
            <div className="hammer-table">
              <table>
                <tbody>
                  {this.state.hammers &&
                    this.state.hammers.map((hammer) => (
                      <tr key={hammer.calls.join('')}>
                        <td>{hammer.calls.join(', ')}</td>
                        <td>{hammer.name}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="errors">No hams found with that zip 🤷‍♂</div>
          ))}
      </>
    )
  }

  private getEm = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    this.setState({ fetchError: undefined })
    if (
      Number.isNaN(Number(this.state.inputValue)) ||
      this.state.inputValue.length < 5 ||
      this.state.inputValue.length > 9
    ) {
      this.setState({ inputError: true })
      return
    }

    this.setState({ hammers: undefined, inputError: false, working: true })
    let fetchError = 'Error fetching Hams 😭'
    try {
      const res = await fetchHams(this.state.inputValue)
      if (res.status === 200) {
        const hammers = await res.json()
        fetchError = undefined
        this.setState({ hammers })
        return
      } else if (res.status === 429) {
        fetchError = 'Slow down, cowboy 😜'
      } else if (res.status === 422) {
        fetchError = (await res.json()).errMessage
      }
    } catch (err) {
      // tslint:disable-next-line:no-console
      // console.error(err)
    } finally {
      this.setState({ fetchError, working: false })
    }
  }
}

const fetchHams = async (zip: string) => {
  return fetch(window.testing ? 'http://localhost:7343' : '/api', {
    body: JSON.stringify({ zip }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
}
