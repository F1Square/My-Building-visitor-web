import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterSociety from "@/pages/RegisterSociety";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterSociety />
    </MemoryRouter>,
  );
}

describe("RegisterSociety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("blocks advancing from step 0 without name/email", () => {
    renderForm();
    fireEvent.click(screen.getByTestId("next-step"));
    expect(screen.getByRole("heading", { name: "Your Details" })).toBeInTheDocument();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Valid email is required")).toBeInTheDocument();
  });

  it("checks an entered referral code with the server before continuing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ valid: false, error: "Invalid referral code" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    renderForm();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Rajesh Patel" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "raj@example.com" } });
    fireEvent.change(screen.getByLabelText(/Referral Code/i), { target: { value: "FAKE1234" } });
    fireEvent.click(screen.getByTestId("next-step"));

    await waitFor(() => expect(screen.getByText("Invalid referral code")).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Your Details" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/inquiries/public/validate-referral"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("requires an image logo and shows state before city", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Rajesh Patel" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "raj@example.com" } });
    fireEvent.click(screen.getByTestId("next-step"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Society Information" })).toBeInTheDocument();
    });

    expect(screen.getByText(/JPG, PNG, WebP, or GIF/i)).toBeInTheDocument();
    expect(screen.getByTestId("logo-input")).toHaveAttribute("accept", "image/*");
    expect(screen.getByTestId("city-select")).toBeDisabled();
    expect(screen.getByTestId("state-select")).toBeInTheDocument();
  });

  it("allows only digits for wings and pincode", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Rajesh Patel" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "raj@example.com" } });
    fireEvent.click(screen.getByTestId("next-step"));
    await waitFor(() => screen.getByRole("heading", { name: "Society Information" }));

    const wings = screen.getByLabelText(/Total Wings/i);
    const pincode = screen.getByLabelText(/Pincode/i);
    fireEvent.change(wings, { target: { value: "a1e2" } });
    fireEvent.change(pincode, { target: { value: "39ab5004" } });

    expect(wings).toHaveValue("12");
    expect(pincode).toHaveValue("395004");
    expect(pincode).toHaveAttribute("placeholder", "395004");
  });

  it("does not show retired payment controls", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Rajesh Patel" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "raj@example.com" } });
    fireEvent.click(screen.getByTestId("next-step"));
    await waitFor(() => screen.getByRole("heading", { name: "Society Information" }));

    expect(screen.queryByText(/Transaction Receipt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Payment Gateway Link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Platform charges/i)).not.toBeInTheDocument();
  });

  it("exposes Online, Cash, and Cheque as multi-select options", async () => {
    const { PAYMENT_METHOD_OPTIONS } = await import("@/data/indiaLocations");
    expect(PAYMENT_METHOD_OPTIONS.map((p) => p.key)).toEqual(["Online", "Cash", "Cheque"]);
  });
});
