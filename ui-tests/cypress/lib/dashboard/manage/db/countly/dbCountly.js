import dbUserovoPageElements from "../../../../../support/elements/dashboard/manage/db/userovo/dbUserovo";

const verifyStaticElementsOfPage = () => {
    cy.verifyElement({
        labelElement: dbUserovoPageElements.PAGE_TITLE,
        labelText: "DB Viewer",
        element: dbUserovoPageElements.PAGE_TITLE_VIEW_GUIDE_BUTTON,
    });

    cy.verifyElement({
        element: dbUserovoPageElements.TAB_USEROVO_DATABASE,
        elementText: "Userovo Database"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.TAB_USEROVO_OUT_DATABASE,
        elementText: "Userovo Out Database"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.TAB_USEROVO_FILE_SYSTEM_DATABASE,
        elementText: "Userovo File System Database"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.COLLECTIONS_LISTBOX,
    });

    cy.verifyElement({
        element: dbUserovoPageElements.LISTBOX_APPLICATION_SELECT,
        elementPlaceHolder: "Select",
        value: "All Apps"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.LISTBOX_SEARCH_INPUT,
        elementPlaceHolder: "Search"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.COLLAPSE_OR_EXPAND_BUTTON,
        elementText: "Collapse All"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.FILTER_BUTTON,
        elementText: "Filter"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.EXPORT_BUTTON,
    });

    cy.verifyElement({
        element: dbUserovoPageElements.DATATABLE_SEARCH_BUTTON,
    });
};

const verifyEmptyPageElements = () => {

    verifyStaticElementsOfPage();

    cy.verifyElement({
        labelElement: dbUserovoPageElements.COLLECTION_AND_APP_NAME_LABEL,
        labelText: "app_crashes"
    });

    cy.verifyElement({
        element: dbUserovoPageElements.EMPTY_TABLE_ICON,
    });

    cy.verifyElement({
        labelElement: dbUserovoPageElements.EMPTY_TABLE_TITLE,
        labelText: "...hmm, seems empty here",
    });

    cy.verifyElement({
        labelElement: dbUserovoPageElements.EMPTY_TABLE_SUBTITLE,
        labelText: "No data found",
    });
};

const verifyFullDataPageElements = () => {

    verifyStaticElementsOfPage();

    cy.verifyElement({
        labelElement: dbUserovoPageElements.COLLECTION_AND_APP_NAME_LABEL,
        labelText: "app_crashes"
    });

    cy.shouldNotExist(dbUserovoPageElements.EMPTY_TABLE_ICON);
};

const clickUserovoDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoPageElements.TAB_USEROVO_DATABASE);
};

const clickUserovoOutDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoPageElements.TAB_USEROVO_OUT_DATABASE);
};

const clickUserovoFileSystemDatabaseTab = () => {
    cy.scrollPageToTop();
    cy.clickElement(dbUserovoPageElements.TAB_USEROVO_FILE_SYSTEM_DATABASE);
};

module.exports = {
    verifyEmptyPageElements,
    verifyFullDataPageElements,
    clickUserovoDatabaseTab,
    clickUserovoOutDatabaseTab,
    clickUserovoFileSystemDatabaseTab
};