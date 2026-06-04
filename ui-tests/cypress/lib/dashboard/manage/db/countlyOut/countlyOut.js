import dbUserovoOutPageElements from "../../../../../support/elements/dashboard/manage/db/userovoOut/userovoOut";

const verifyStaticElementsOfPage = () => {
    cy.verifyElement({
        labelElement: dbUserovoOutPageElements.PAGE_TITLE,
        labelText: "DB Viewer",
        element: dbUserovoOutPageElements.PAGE_TITLE_VIEW_GUIDE_BUTTON,
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.TAB_USEROVO_DATABASE,
        elementText: "Userovo Database"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.TAB_USEROVO_OUT_DATABASE,
        elementText: "Userovo Out Database"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.TAB_USEROVO_FILE_SYSTEM_DATABASE,
        elementText: "Userovo File System Database"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.LISTBOX_APPLICATION_SELECT,
        elementPlaceHolder: "Select",
        value: "All Apps"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.LISTBOX_SEARCH_INPUT,
        elementPlaceHolder: "Search"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.COLLAPSE_OR_EXPAND_BUTTON,
        elementText: "Collapse All"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.FILTER_BUTTON,
        elementText: "Filter"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.EXPORT_BUTTON,
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.DATATABLE_SEARCH_BUTTON,
    });
};

const verifyEmptyPageElements = () => {

    verifyStaticElementsOfPage();

    cy.verifyElement({
        element: dbUserovoOutPageElements.COLLECTIONS_LISTBOX_NO_DATA,
        elementText: "No match found"
    });

    cy.verifyElement({
        element: dbUserovoOutPageElements.EMPTY_TABLE_ICON,
    });

    cy.verifyElement({
        labelElement: dbUserovoOutPageElements.EMPTY_TABLE_TITLE,
        labelText: "...hmm, seems empty here",
    });

    cy.verifyElement({
        labelElement: dbUserovoOutPageElements.EMPTY_TABLE_SUBTITLE,
        labelText: "No data found",
    });
};

const verifyFullDataPageElements = () => {

    verifyStaticElementsOfPage();

    cy.shouldNotExist(dbUserovoOutPageElements.EMPTY_TABLE_ICON);
};

const clickUserovoDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoOutPageElements.TAB_USEROVO_DATABASE);
};

const clickUserovoOutDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoOutPageElements.TAB_USEROVO_OUT_DATABASE);
};

const clickUserovoFileSystemDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoOutPageElements.TAB_USEROVO_FILE_SYSTEM_DATABASE);
};

module.exports = {
    verifyEmptyPageElements,
    verifyFullDataPageElements,
    clickUserovoDatabaseTab,
    clickUserovoOutDatabaseTab,
    clickUserovoFileSystemDatabaseTab
};