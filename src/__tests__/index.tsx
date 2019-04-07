import React = require('react')
import { fireEvent, render } from 'react-testing-library'
import { App } from '../app'

declare var global: any
declare var jest: any
// tslint:disable-next-line:no-console
console.debug = () => undefined

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ status: 200 }))
})

const pause = () => new Promise((r) => setTimeout(r))

it('renders an input and button', () => {
  const { getByLabelText, getByText } = render(<App />)
  getByLabelText(/zip code/i)
  getByText(/search/i)
})

it('renders an about link', () => {
  const { getByText } = render(<App />)
  const link = getByText(/about/i)
  expect(link.hasAttribute('href'))
  expect(link.getAttribute('href')).toBe('/about.html')
})

it('submits on clicking search and shows loading state', () => {
  const { getByLabelText, getByText } = render(<App />)

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: '92034' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)

  expect(global.fetch).toHaveBeenCalledWith('/api', {
    body: '{"zip":"92034"}',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  })
  getByText('📻')
})

it('validates short input', () => {
  const { getByLabelText, getByText } = render(<App />)
  global.fetch.mockReset()

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: '920' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)

  expect(global.fetch).not.toHaveBeenCalled()
  getByText(/that doesn't look like a zip/i)
})

it('validates long input', () => {
  const { getByLabelText, getByText } = render(<App />)
  global.fetch.mockReset()

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: '9203492034' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)

  expect(global.fetch).not.toHaveBeenCalled()
  getByText(/that doesn't look like a zip/i)
})

it('validates non numerical input', () => {
  const { getByLabelText, getByText } = render(<App />)
  global.fetch.mockReset()

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: 'pondelinp' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)

  expect(global.fetch).not.toHaveBeenCalled()
  getByText(/that doesn't look like a zip/i)
})

it('shows error if non-200 is received', async () => {
  const { getByLabelText, getByText } = render(<App />)
  global.fetch = jest.fn(() => Promise.resolve({ status: 400 }))

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: '92043' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)
  await pause()

  getByText('Error fetching Hams 😭')
})

it('shows message if 429 is received', async () => {
  const { getByLabelText, getByText } = render(<App />)
  global.fetch = jest.fn(() => Promise.resolve({ status: 429 }))

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: '92043' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)
  await pause()

  getByText('Slow down, cowboy 😜')
})

it('displays fetched data on success', async () => {
  const { getByLabelText, getByText } = render(<App />)
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            calls: ['kk2klr'],
            name: 'Pong!',
            zip: 92056
          },
          {
            calls: ['ac6at', 'ac7xx'],
            name: 'Russ!',
            zip: 92524
          }
        ]),
      status: 200
    })
  )

  const input = getByLabelText(/zip code/i)
  fireEvent.change(input, { target: { value: '92043' } })
  const submitButton = getByText(/search/i)
  fireEvent.click(submitButton)
  await pause()

  getByText('Russ!')
  getByText('Pong!')
  getByText('ac6at, ac7xx')
  getByText('kk2klr')
})
