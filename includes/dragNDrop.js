var dragSources = [];

var $draggedElement = undefined;

var mouseStartDragX = 0;
var mouseStartDragY = 0;

var dragElementOffsetX = 0;
var dragElementOffsetY = 0;

/*
 * Initializes a DOM element to be a drag source
 * 
 *  Method will iterate over all the element's children and inject the needed mouse event
 *   handlers so that the children will be draggable
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
		
		//get the current mouse position
		mouseStartDragX = e.clientX;
		mouseStartDragY = e.clientY;
		
		dragElementOffsetX = $dragableElement.offset().left;
		dragElementOffsetY = $dragableElement.offset().top;
		
		//change the z index so we can drag the element
		$dragableElement.css("zIndex", "1000px");
		
		//initialize the handlers on the document element
		$(document).mousemove(drag);
		$(document).mouseup(finishDrag);
		
		// prevent text selection in IE
        $(document).selectstart(function () { return false; });
	}
}

/*
 * The actual drag method
 */
function drag(e) {
	if($draggedElement != undefined) {
		$draggedElement.css("left",(dragElementOffsetX + e.clientX - mouseStartDragX) + 'px');
		$draggedElement.css("top",(dragElementOffsetY + e.clientY - mouseStartDragY) + 'px');
	}
}

function finishDrag(e) {
	if($draggedElement != undefined) {
		//remove the handlers for the document element
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");
		$(document).unbind("selectstart");
		
		$draggedElement.css({'cursor':'default'});
		
		$draggedElement = undefined;
	}	
}

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

function isDragSource($element) {
	for( var i = 0 ; i < dragSources.length ; i++ ) {
		if( dragSources[i][0] === $element[0] ) {
			return true;
		}
	}
	
	return false;
}
