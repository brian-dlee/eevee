import { ev, must } from "./index"

describe('eevee', () => {
  test('basic', () => {
    const result: string = ev({ "VALUE": "1" }, "VALUE", must);
    expect(result).toBe("1")
  })
})
