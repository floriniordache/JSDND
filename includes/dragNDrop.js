/*
 * JS file containing the Drag and Drop utility methods
 */

//array holding the jQuery objects defined as drag sources
var dragSources = [];

//array holding the jQuery objects defined as drop destinations
var dropDestinations = [];

//currently dragged element
var $draggedElement = undefined;

//current hovered drop target
var $hoveredDropTarget = undefined;

//coordinates of the mouse when dragging has started 
var mouseStartDragX = 0;
var mouseStartDragY = 0;

//position of the dragged element when dragging has started
var dragElementOffsetX = 0;
var dragElementOffsetY = 0;

/*
 * Initializes a DOM element to be a drag source
 * 
 *  Method will inject the needed mouse event handlers so that
 *  the children of the drag source element will be draggable
 */
function initializeDragSource(elementId) {
	if($("#"+elementId).length > 0) {
		dragSources[dragSources.length] = $("#"+elementId);
		$("#"+elementId).children().mouseover(dragMouseOver);
		$("#"+elementId).children().mouseout(dragMouseOut);
		$("#"+elementId).children().mousedown(startDragging);
	}
	else {
		alert( "Could not initialize element with id " + elementId + " as a drag source! " );
	}
}

/*
 * Highlights a draggable element when the mouse hovers over it
 */
function dragMouseOver(e) {
	//only the immediate children of the source are draggable, need to find it based on the actual mouse over target
	$dragableElement = getDragableElement($(e.target));
	if( $dragableElement != undefined ) {
		$dragableElement.css("border", "1px solid #FF0000");
		$dragableElement.css({'cursor':'default'});
	}
}

/*
 * Removes highlightling for the draggable element when the mouse moves away from it
 */
function dragMouseOut(e) {
	$dragableElement = getDragableElement($(e.target));
	if( $dragableElement != undefined ) {
		$dragableElement.css("border", "0");
	}
}

/*
 * Starts dragging the selected element
 */
function startDragging(e) {
	$dragableElement = getDragableElement($(e.target));
	if( $dragableElement != undefined ) {
		//set the current draggable element, which we'll use in the mouse move handler
		$draggedElement = $dragableElement;
		$dragableElement.css("border", "1px solid #00FF00");
		$dragableElement.css("position", "absolute");

		//get the position of the dragged element
		dragElementOffsetX = $dragableElement.offset().left;
		dragElementOffsetY = $dragableElement.offset().top;
		
		//get the current mouse position
		mouseStartDragX = e.clientX;
		mouseStartDragY = e.clientY;
		
		//change the z index so we can drag the element
		$dragableElement.css("z-index", "1000px");
		
		//position the draggable element to the right of the mouse cursor
		$dragableElement.css("left",(dragElementOffsetX + mouseStartDragX + 5 ) + 'px');
			
		//initialize the handlers on the document element
		$(document).mousemove(drag);
		$(document).mouseup(finishDrag);

		//append the overlay to the body, so the iframes don't disupt the mouse handler events
		$('body').append('<div id="overlay"></div>');
		
		//set the cursor to no-drop state
		$("#overlay").css("cursor", "no-drop");
		
		//disable the text selection
		document.onselectstart = function () { return false; };
	}
}


/*
 * Initializes a DOM element to be a drop target
 * 
 * Injects the mouse event handlers so that DOM elements can be dropped on the drop target
 */
function initializeDropTargetIframe(frameElement) {
	//register the iframe with the parent
	if( $("#"+frameElement).length > 0 ) {
		dropDestinations[dropDestinations.length] = $("#"+frameElement);
	}
	else {
		alert( "Could not initialize iframe " +frameElement+ " as a drop target! " );
	}
}

/*
 * The actual drag method
 * Move the dragged element as the mouse is moved
 */
function drag(e) {
	if($draggedElement != undefined) {
		//move the currently dragged element
		$draggedElement.css("left",(dragElementOffsetX + e.clientX + /*mouseStartDragX*/ + 5) + 'px');
		$draggedElement.css("top",(dragElementOffsetY + e.clientY - mouseStartDragY) + 'px');
		$dragableElement.css("border", "1px solid #00FF00");
		
		//determine if mouse is over a drop target, to properly change the cursor state
		var dropTarget = getDropTarget(e.clientX, e.clientY);
		if(dropTarget != undefined) {
			$("#overlay").css("cursor", "default");
		}
		else {
			$("#overlay").css("cursor", "no-drop");			
		}
		
	}
}

/*
 * Dragging has finished. Must determine if the mouse is over a drop target so that we can 
 * initialize the drop operation 
 */
function finishDrag(e) {
	if($draggedElement != undefined) {
		//remove the handlers for the document element
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");

		//enable the text selection
		document.onselectstart = function () { return true; };
		
		//remove the div overlay
		$('#overlay').remove();

		$dragableElement.css("border", "0");
		
		//determine if the mouse is over a drop target
		var dropTarget = getDropTarget(e.clientX, e.clientY);
		if(dropTarget != undefined) {
			//send the dragged element to the receiving iframe
			dropTarget[0].contentWindow.receiveDroppedElements($dragableElement);

			//remove the dragged element from the source container
			$dragableElement.remove();
			
			//make an ajax request
			$.ajax({
				url: "serviceEndpoint.xml",
				type: "get",
				//success handler
				success: function(response, textStatus, jqXHR){			
				    //alert the message
					var serverResponse = $(response).find("serviceResponse").attr("status");
					if( serverResponse == undefined ) {
						//must be the IE issue, force parse
				        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM"); 
				        xmlDoc.loadXML(response);
				        serverResponse = $(xmlDoc).find("serviceResponse").attr("status");
					}

					var alertMessage = "Server Response:" + serverResponse + "\n" +
								"Drag ID:" + $dragableElement.attr("id");
					alert(alertMessage);
				},
				//error handler
				error: function(jqXHR, textStatus, errorThrown){
				    // display the error
				    alert(
					"The following error occured: "+
					textStatus + errorThrown
				    );
				}
			});
		}
		else {
			/*
			 * drag finished on a surface that does not accept drops
			 * return the element to the original position
			 */
			$dragableElement.css("z-index", "");
			$dragableElement.css("left","");
			$dragableElement.css("top","");
			$dragableElement.css("position", "");
		}

		$(document).css("cursor", "default");

		$draggedElement = undefined;
	}	
}

/*
* Determines if the event coordinates are within the boundaries of a drop target
*/
function getDropTarget(posX, posY) {
	for(var i = 0 ; i < dropDestinations.length ; i++) {
		var dropDest = dropDestinations[i];
		if( posX >= dropDest.position().left && posX <= (dropDest.position().left + dropDest.width()) && 
				posY >= dropDest.position().top && posY <= (dropDest.position().top + dropDest.height())) {
			return dropDest;
		}
	}

	return undefined;
}

/*
* Method called from the top frame when a drop event has completed
*/
function receiveDroppedElements($element) {
	
	//clone the dropped element
	$clonedElement = $element.clone();
	
	//clean the styles that allowed dragging
	$clonedElement.css("z-index", "");
	$clonedElement.css("left","");
	$clonedElement.css("top","");
	$clonedElement.css("position", "");	
	
	//append the element to the body
	$('body').append($clonedElement[0].outerHTML);
}

/*
 * Search through the parents of $element to determine the immediate child of a drag source.
 */
function getDragableElement($element) {
	$parents = $element.parents();
	
	for( var parentIdx = 0 ; parentIdx < $parents.length ; parentIdx ++ ) {
		if( isDragSource($($parents[parentIdx])) ) {
			//reached the drag source, it means that the draggable element is at the previous index
			if( parentIdx == 0 ) {
				return $element;
			}
			else {
				return $($parents[parentIdx - 1]);				
			}
		}
	}
	
	return undefined;
}

/*
 * Searches through the drag sources array and determine if $element is present
 */
function isDragSource($element) {
	for( var i = 0 ; i < dragSources.length ; i++ ) {
		if( dragSources[i][0] === $element[0] ) {
			return true;
		}
	}
	
	return false;
}
