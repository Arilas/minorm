export async function withRetry<T>(
  handler: (attempt?: number) => Promise<T>,
  times = 5,
  timeoutBetweenTries = 500,
): Promise<T> {
  const delay = () =>
    new Promise(resolve => setTimeout(resolve, timeoutBetweenTries))
  for (let i = 1; i <= times; i++) {
    try {
      return await handler(i)
    } catch (err) {
      if (i == times) {
        throw err
      } else {
        await delay()
      }
    }
  }
  throw new Error('Wrong amount of attempts')
}
