describe("SCI query panel", () => {
  beforeEach(() => {
    cy.visit("/index.html");
    cy.get("#tab-query", { timeout: 15000 }).click();
  });

  it("shows query results without allowing non-model output to apply", () => {
    cy.get("#queryEditor").clear().type("(list-items map)", { parseSpecialCharSequences: false });
    cy.get("#runQuery").click();

    cy.get("#queryResult", { timeout: 15000 }).should("contain", '"id": "gestalt"');
    cy.get("#applyQueryResult").should("be.disabled");
    cy.get(".blockscape-query-pill").should("contain", "Context:");
  });

  it("blocks unsafe js interop", () => {
    cy.get("#queryEditor").clear().type("js/Math.PI", { parseSpecialCharSequences: false });
    cy.get("#runQuery").click();

    cy.get("#queryError", { timeout: 15000 })
      .should("be.visible")
      .and("contain", "JavaScript interop via js/");
    cy.get("#applyQueryResult").should("be.disabled");
  });

  it("applies a valid transformed model to the active map", () => {
    cy.get("#queryEditor").clear().type('(filter-category map "experience")', {
      parseSpecialCharSequences: false,
    });
    cy.get("#runQuery").click();

    cy.get(".blockscape-query-pill", { timeout: 15000 }).should("contain", "Valid model");
    cy.get("#applyQueryResult").should("not.be.disabled").click();

    cy.get("#tab-map").click();
    cy.get("#app .category", { timeout: 15000 }).should("have.length", 1);
    cy.get("#app .cat-title").should("contain", "User Experience");
    cy.get("#app .tile").should("have.length", 5);
  });
});
