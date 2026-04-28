const priceIds = {
  bitcoin: ["btc-price"],
  ethereum: ["eth-price"],
  binancecoin: ["bnb-price"],
  solana: ["sol-price"],
  ripple: ["xrp-price"],
  cardano: ["ada-price"],
  dogecoin: ["doge-price"],
  tron: ["trx-price"],
  "the-open-network": ["ton-price"],
  tether: ["usdt-price"],
};

const statusElement = document.getElementById("price-status");
const dropdownToggles = document.querySelectorAll("[data-dropdown-toggle]");

function formatUsd(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Немає даних";
  }

  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (value >= 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }

  if (value >= 0.0001) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(value);
}

function updatePriceText(id, text) {
  const element = document.querySelector(`[data-price-id="${id}"]`);
  if (element) {
    element.textContent = text;
  }
}

function setStatus(text) {
  if (statusElement) {
    statusElement.textContent = text;
  }
}

function closeAllDropdowns(exceptId) {
  dropdownToggles.forEach((toggle) => {
    const targetId = toggle.dataset.dropdownToggle;
    const panel = document.getElementById(targetId);
    const shouldStayOpen = targetId === exceptId;

    toggle.setAttribute("aria-expanded", shouldStayOpen ? "true" : "false");
    if (panel) {
      panel.hidden = !shouldStayOpen;
    }
  });
}

async function fetchPrices() {
  try {
    setStatus("Оновлено");

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,tron,the-open-network,tether&vs_currencies=usd",
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    Object.entries(priceIds).forEach(([coinId, elementId]) => {
      const value = data?.[coinId]?.usd;
      elementId.forEach((targetId) => {
        updatePriceText(targetId, formatUsd(value));
      });
    });

    setStatus("Дані актуальні");
  } catch (error) {
    Object.values(priceIds).forEach((elementIds) => {
      elementIds.forEach((targetId) => {
        updatePriceText(targetId, "Помилка завантаження");
      });
    });

    setStatus("Помилка API");

    console.error("Не вдалося завантажити ціни:", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fetchPrices();

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.dataset.dropdownToggle;
      const panel = document.getElementById(targetId);
      const isOpen = panel && !panel.hidden;

      closeAllDropdowns(isOpen ? undefined : targetId);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideDropdown = event.target.closest(".nav-dropdown");
    if (!clickedInsideDropdown) {
      closeAllDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllDropdowns();
    }
  });

  const accountForm = document.querySelector(".account-form");
  if (accountForm) {
    accountForm.addEventListener("submit", (event) => {
      event.preventDefault();
      closeAllDropdowns();
    });
  }
});
