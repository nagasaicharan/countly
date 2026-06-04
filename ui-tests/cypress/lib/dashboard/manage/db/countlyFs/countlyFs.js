import dbUserovoFsPageElements from "../../../../../support/elements/dashboard/manage/db/userovoFs/userovoFs";

const verifyStaticElementsOfPage = () => {
    cy.verifyElement({
        labelElement: dbUserovoFsPageElements.PAGE_TITLE,
        labelText: "DB Viewer",
        element: dbUserovoFsPageElements.PAGE_TITLE_VIEW_GUIDE_BUTTON,
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.TAB_USEROVO_DATABASE,
        elementText: "Userovo Database"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.TAB_USEROVO_OUT_DATABASE,
        elementText: "Userovo Out Database"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.TAB_USEROVO_FILE_SYSTEM_DATABASE,
        elementText: "Userovo File System Database"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.LISTBOX_APPLICATION_SELECT,
        elementPlaceHolder: "Select",
        value: "All Apps"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.LISTBOX_SEARCH_INPUT,
        elementPlaceHolder: "Search"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.COLLAPSE_OR_EXPAND_BUTTON,
        elementText: "Collapse All"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.FILTER_BUTTON,
        elementText: "Filter"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.EXPORT_BUTTON,
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.DATATABLE_SEARCH_BUTTON,
    });
};

const verifyEmptyPageElements = () => {

    verifyStaticElementsOfPage();

    cy.verifyElement({
        element: dbUserovoFsPageElements.COLLECTIONS_LISTBOX_NO_DATA,
        elementText: "No match found"
    });

    cy.verifyElement({
        element: dbUserovoFsPageElements.EMPTY_TABLE_ICON,
    });

    cy.verifyElement({
        labelElement: dbUserovoFsPageElements.EMPTY_TABLE_TITLE,
        labelText: "...hmm, seems empty here",
    });

    cy.verifyElement({
        labelElement: dbUserovoFsPageElements.EMPTY_TABLE_SUBTITLE,
        labelText: "No data found",
    });
};

const verifyFullDataPageElements = () => {

    verifyStaticElementsOfPage();

    cy.shouldNotExist(dbUserovoFsPageElements.EMPTY_TABLE_ICON);
};

const clickUserovoDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoFsPageElements.TAB_USEROVO_DATABASE);
};

const clickUserovoOutDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoFsPageElements.TAB_USEROVO_OUT_DATABASE);
};

const clickUserovoFileSystemDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoFsPageElements.TAB_USEROVO_FILE_SYSTEM_DATABASE);
};

module.exports = {
    verifyEmptyPageElements,
    verifyFullDataPageElements,
    clickUserovoDatabaseTab,
    clickUserovoOutDatabaseTab,
    clickUserovoFileSystemDatabaseTab
};