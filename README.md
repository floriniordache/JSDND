JSDND
=====

JavaScript Drag and Drop library

3rd party libraries:
JQuery 1.7.2

The library was tested with the following browsers:
IE 8
FF 12,13
GoogleChrome 22

Description & Usage
===================

The library consists of a JS file: dragNDrop.js.
It has to be included in the pages where drag and drop functionality is required: drag source page and drop destination iframes.
The library uses JQuery, when importing it please make sure that JQuery is already present.

Both source document and the destination iframe must be in the same domain; the library does not support cross-domain drag & drop functionality.

After importing the library, at least two method calls are required to initialize the drag source (initializeDragSource) 
and the drop target iframe(initializeDropTargetIframe). More than one drag source / drop target can be defined.


