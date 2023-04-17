/**
 * @jest-environment jsdom
 */

import { getByTestId, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import NewBillUI from "../views/NewBillUI.js";
import mockStore from "../__mocks__/store"
import store from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockStore)

describe("Given I am connected as an employee", () => {
  let newBills = {}
  beforeEach(() => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    newBills = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })
    document.body.innerHTML = BillsUI({ data: bills })
  })

  describe("When I am on Bills Page", () => {


    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(screen.getByTestId("icon-window")).toBeTruthy()
      expect(windowIcon.classList).toContain('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      // document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => new Date(b.date) - new Date(a.date)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    describe("when i click on new bill bouton", () => {
      test("should be return new bills page", () => {
        newBills.handleClickNewBill()
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
        expect(screen.queryByText("Justificatif")).toBeTruthy()
      })
    })

    describe("when i click on the eye icon", () => {
      test("Should be open modal", () => {
        const iconEye = screen.getAllByTestId('icon-eye')[0]
        $.fn.modal = jest.fn()
        iconEye.addEventListener('click', newBills.handleClickIconEye(iconEye))
        userEvent.click(iconEye)
        expect($.fn.modal).toHaveBeenCalled();

      })
    })
  })

  describe("When i called the API", () => {
    jest.spyOn(mockStore, "bills")
    test("fetches bills from mock API GET", async () => {
      const newBills = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      newBills.getBills()
        .then(data => {
          expect(data.length).toBe(4)
        })
    })

    test("should be 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
  
    test("should be 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

})
