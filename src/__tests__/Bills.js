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



import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Should be return newBills page", async () => {



      // document.body.innerHTML = BillsUI({ data: bills })
      const handleClickNewBill = jest.fn(() => newBills.handleClickNewBill())
      const btnNewBill = screen.getByTestId("btn-new-bill")
      btnNewBill.addEventListener("click", handleClickNewBill)
      userEvent.click(btnNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(handleClickNewBill).not.toBe("undefined")
    })
    test("Should be open modal", () => {
      const eyesIcons = screen.getAllByTestId('icon-eye')
      const modaleFile = document.getElementById("modaleFile")
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
      const handleClickIconEye = jest.fn((iconEye) => newBills.handleClickIconEye(iconEye))
      eyesIcons.forEach((iconEye) => {
        iconEye.addEventListener("click", handleClickIconEye(iconEye))
        userEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()
      })

      expect(modaleFile.classList).toContain("show")

    })

  })
  test("fetches bills from mock API GET", async () => {
    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld@a" }));
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)
    await waitFor(() => screen.getByText("Mes notes de frais"))
    await waitFor(() => screen.findByText("En attente"))
    
    screen.debug(screen.getByText("Type"))
    // const status  = await screen.getByText("En attente")
    // expect(status).toBeTruthy()
    // const contentRefused  = await screen.getByText("Refusé (2)")
    // expect(contentRefused).toBeTruthy()
    // expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
  })


})
