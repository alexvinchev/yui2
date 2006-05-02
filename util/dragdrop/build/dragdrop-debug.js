
/*                                                                                                                                                      
Copyright (c) 2006, Yahoo! Inc. All rights reserved.                                                                                                    
Code licensed under the BSD License:                                                                                                                    
http://developer.yahoo.net/yui/license.txt                                                                                                              
version: 0.10.0                                                                                                                                         
*/ 

/* Copyright (c) 2006 Yahoo! Inc. All rights reserved. */

/**
 * Defines the interface and base operation of items that that can be 
 * dragged or can be drop targets.  It was designed to be extended, overriding
 * the event handlers for startDrag, onDrag, onDragOver, onDragOut.
 * Up to three html elements can be associated with a DragDrop instance:
 * <ul>
 * <li>linked element: the element that is passed into the constructor.
 * This is the element which defines the boundaries for interaction with 
 * other DragDrop objects.</li>
 * <li>handle element(s): The drag operation only occurs if the element that 
 * was clicked matches a handle element.  By default this is the linked 
 * element, but there are times that you will want only a portion of the 
 * linked element to initiate the drag operation, and the setHandleElId() 
 * method provides a way to define this.</li>
 * <li>drag element: this represents an the element that would be moved along
 * with the cursor during a drag operation.  By default, this is the linked
 * element itself as in {@link YAHOO.util.DD}.  setDragElId() lets you define
 * a separate element that would be moved, as in {@link YAHOO.util.DDProxy}
 * </li>
 * </ul>
 * This class should not be instantiated until the onload event to ensure that
 * the associated elements are available.
 * The following would define a DragDrop obj that would interact with any 
 * other * DragDrop obj in the "group1" group:
 * <pre>
 *  dd = new YAHOO.util.DragDrop("div1", "group1");
 * </pre>
 * Since none of the event handlers have been implemented, nothing would 
 * actually happen if you were to run the code above.  Normally you would 
 * override this class or one of the default implementations, but you can 
 * also override the methods you want on an instance of the class...
 * <pre>
 *  dd.onDragDrop = function(e, id) {
 *   alert("dd was dropped on " + id);
 *  }
 * </pre>
 * @constructor
 * @param {String} id of the element that is linked to this instance
 * @param {String} sGroup the group of related DragDrop objects
 */
YAHOO.util.DragDrop = function(id, sGroup) {
    if (id) {
        this.init(id, sGroup); 
    }
};

YAHOO.util.DragDrop.prototype = {

    /**
     * The id of the element associated with this object.  This is what we 
     * refer to as the "linked element" because the size and position of 
     * this element is used to determine when the drag and drop objects have 
     * interacted.
     *
     * @type String
     */
    id: null,

    /**
     * The id of the element that will be dragged.  By default this is same 
     * as the linked element , but could be changed to another element. Ex: 
     * YAHOO.util.DDProxy
     *
     * @type String
     * @private
     */
    dragElId: null, 

    /**
     * the id of the element that initiates the drag operation.  By default 
     * this is the linked element, but could be changed to be a child of this
     * element.  This lets us do things like only starting the drag when the 
     * header element within the linked html element is clicked.
     *
     * @type String
     * @private
     */
    handleElId: null, 

    /**
     * An associative array of HTML tags that will be ignored if clicked.
     * @type {string: string}
     */
    invalidHandleTypes: null, 

    /**
     * An associative array of ids for elements that will be ignored if clicked
     * @type {string: string}
     */
    invalidHandleIds: null, 

    /**
     * An indexted array of css class names for elements that will be ignored
     * if clicked.
     * @type string[]
     */
    invalidHandleClasses: null, 

    /**
     * The linked element's absolute X position at the time the drag was 
     * started
     *
     * @type int
     * @private
     */
    startPageX: 0,

    /**
     * The linked element's absolute X position at the time the drag was 
     * started
     *
     * @type int
     * @private
     */
    startPageY: 0,

    /**
     * The group defines a logical collection of DragDrop objects that are 
     * related.  Instances only get events when interacting with other 
     * DragDrop object in the same group.  This lets us define multiple 
     * groups using a single DragDrop subclass if we want.
     * @type {string: string}
     */
    groups: null,

    /**
     * Individual drag/drop instances can be locked.  This will prevent 
     * onmousedown start drag.
     *
     * @type boolean
     * @private
     */
    locked: false,

    /**
     * Lock this instance
     */
    lock: function() { this.locked = true; },

    /**
     * Unlock this instace
     */
    unlock: function() { this.locked = false; },

    /**
     * By default, all insances can be a drop target.  This can be disabled by
     * setting isTarget to false.
     *
     * @type boolean
     */
    isTarget: true,

    /**
     * The padding configured for this drag and drop object for calculating
     * the drop zone intersection with this object.
     * @type int[]
     */
    padding: null,

    /**
     * @private
     */
    _domRef: null,

    /**
     * Internal typeof flag
     * @private
     */
    __ygDragDrop: true,

    /**
     * Set to true when horizontal contraints are applied
     *
     * @type boolean
     * @private
     */
    constrainX: false,

    /**
     * Set to true when vertical contraints are applied
     *
     * @type boolean
     * @private
     */
    constrainY: false,

    /**
     * The left constraint
     *
     * @type int
     * @private
     */
    minX: 0,

    /**
     * The right constraint
     *
     * @type int
     * @private
     */
    maxX: 0,

    /**
     * The up constraint 
     *
     * @type int
     * @private
     */
    minY: 0,

    /**
     * The down constraint 
     *
     * @type int
     * @private
     */
    maxY: 0,

    /**
     * Maintain offsets when we resetconstraints.  Used to maintain the 
     * slider thumb value, and this needs to be fixed.
     * @type boolean
     */
    maintainOffset: false,

    /**
     * Array of pixel locations the element will snap to if we specified a 
     * horizontal graduation/interval.  This array is generated automatically
     * when you define a tick interval.
     * @type int[]
     */
    xTicks: null,

    /**
     * Array of pixel locations the element will snap to if we specified a 
     * vertical graduation/interval.  This array is generated automatically 
     * when you define a tick interval.
     * @type int[]
     */
    yTicks: null,

    /**
     * By default the drag and drop instance will only respond to the primary
     * button click (left button for a right-handed mouse).  Set to true to
     * allow drag and drop to start with any mouse click that is propogated
     * by the browser
     * @type boolean
     */
    primaryButtonOnly: true,

    /**
     * The availabe property is false until the linked dom element is accessible.
     * @type boolean
     */
    available: false,

    /**
     * Code that executes immediately before the startDrag event
     * @private
     */
    b4StartDrag: function(x, y) { },

    /**
     * Abstract method called after a drag/drop object is clicked
     * and the drag or mousedown time thresholds have beeen met.
     *
     * @param {int} X click location
     * @param {int} Y click location
     */
    startDrag: function(x, y) { /* override this */ },

    /**
     * Code that executes immediately before the onDrag event
     * @private
     */
    b4Drag: function(e) { },

    /**
     * Abstract method called during the onMouseMove event while dragging an 
     * object.
     *
     * @param {Event} e
     */
    onDrag: function(e) { /* override this */ },

    /**
     * Code that executes immediately before the onDragEnter event
     * @private
     */
    // b4DragEnter: function(e) { },

    /**
     * Abstract method called when this element fist begins hovering over 
     * another DragDrop obj
     *
     * @param {Event} e
     * @param {String || YAHOO.util.DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of one or more 
     * dragdrop items being hovered over.
     */
    onDragEnter: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOver event
     * @private
     */
    b4DragOver: function(e) { },

    /**
     * Abstract method called when this element is hovering over another 
     * DragDrop obj
     *
     * @param {Event} e
     * @param {String || YAHOO.util.DragDrop[]} id In POINT mode, the element
     * id this is hovering over.  In INTERSECT mode, an array of dd items 
     * being hovered over.
     */
    onDragOver: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragOut event
     * @private
     */
    b4DragOut: function(e) { },

    /**
     * Abstract method called when we are no longer hovering over an element
     *
     * @param {Event} e
     * @param {String || YAHOO.util.DragDrop[]} id In POINT mode, the element
     * id this was hovering over.  In INTERSECT mode, an array of dd items 
     * that the mouse is no longer over.
     */
    onDragOut: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the onDragDrop event
     * @private
     */
    b4DragDrop: function(e) { },

    /**
     * Abstract method called when this item is dropped on another DragDrop 
     * obj
     *
     * @param {Event} e
     * @param {String || YAHOO.util.DragDrop[]} id In POINT mode, the element
     * id this was dropped on.  In INTERSECT mode, an array of dd items this 
     * was dropped on.
     */
    onDragDrop: function(e, id) { /* override this */ },

    /**
     * Code that executes immediately before the endDrag event
     * @private
     */
    b4EndDrag: function(e) { },

    /**
     * Fired when we are done dragging the object
     *
     * @param {Event} e
     */
    endDrag: function(e) { /* override this */ },

    /**
     * Code executed immediately before the onMouseDown event

     * @param {Event} e
     * @private
     */
    b4MouseDown: function(e) {  },

    /**
     * Event handler that fires when a drag/drop obj gets a mousedown
     * @param {Event} e
     */
    onMouseDown: function(e) { /* override this */ },

    /**
     * Event handler that fires when a drag/drop obj gets a mouseup
     * @param {Event} e
     */
    onMouseUp: function(e) { /* override this */ },
   
    /**
     * Override the onAvailable method to do what is needed after the initial
     * position was determined.
     */
    onAvailable: function () { 
        this.logger.debug("onAvailable (base)"); 
    },

    /**
     * Returns a reference to the linked element
     *
     * @return {HTMLElement} the html element 
     */
    getEl: function() { 
        if (!this._domRef) {
            this._domRef = this.DDM.getElement(this.id); 
        }

        return this._domRef;
    },

    /**
     * Returns a reference to the actual element to drag.  By default this is
     * the same as the html element, but it can be assigned to another 
     * element. An example of this can be found in YAHOO.util.DDProxy
     *
     * @return {HTMLElement} the html element 
     */
    getDragEl: function() {
        return this.DDM.getElement(this.dragElId);
    },

    /**
     * Sets up the DragDrop object.  Must be called in the constructor of any
     * YAHOO.util.DragDrop subclass
     *
     * @param id the id of the linked element
     * @param {String} sGroup the group of related items
     * element is supposed to be a target only, set to false.
     */
    init: function(id, sGroup) {
        this.initTarget(id, sGroup);
        YAHOO.util.Event.addListener(this.id, "mousedown", 
                                          this.handleMouseDown, this, true);
    },

    /**
     * Initializes Targeting functionality only... the object does not
     * get a mousedown handler.
     *
     * @param id the id of the linked element
     * @param {String} sGroup the group of related items
     * element is supposed to be a target only, set to false.
     */
    initTarget: function(id, sGroup) {

        // create a local reference to the drag and drop manager
        this.DDM = YAHOO.util.DDM;

        // create a logger instance
        this.logger = new ygLogger("DragDrop");

        // set the default padding
        this.padding = [0, 0, 0, 0];

        // initialize the groups array
        this.groups = {};

        // set the id
        this.id = id;

        // the element is a drag handle by default
        this.setDragElId(id); 

        // by default, clicked anchors will not start drag operations
        this.invalidHandleTypes = { A: "A" };
        this.invalidHandleIds = {};
        this.invalidHandleClasses = [];

        // We don't want to register this as the handle with the manager
        // so we just set the id rather than calling the setter
        this.handleElId = id;

        // cache the position of the element if we can
        // if (document && document.body) {
            // this.setInitPosition();
        // }

        // var self = this;
        YAHOO.util.Event.onAvailable(id, this.handleOnAvailable, this, true);

        // add to an interaction group
        this.addToGroup((sGroup) ? sGroup : "default");
    },

    /**
     * Executed when the linked element is available
     * @private
     */
    handleOnAvailable: function() {
        this.logger.debug("handleOnAvailable");
        this.available = true;
        this.resetConstraints();
        this.onAvailable();
    },

     /**
     * Configures the padding for the target zone in px.  Effectively expands
     * (or reduces) the virtual object size for targeting calculations.  
     * Supports css-style shorthand; if only one parameter is passed, all sides
     * will have that padding, and if only two are passed, the top and bottom
     * will have the first param, the left and right the second.
     * @param {int} iTop    Top pad
     * @param {int} iRight  Right pad
     * @param {int} iBot    Bot pad
     * @param {int} iLeft   Left pad
     */
    setPadding: function(iTop, iRight, iBot, iLeft) {
        // this.padding = [iLeft, iRight, iTop, iBot];
        if (!iRight && 0 !== iRight) {
            this.padding = [iTop, iTop, iTop, iTop];
        } else if (!iBot && 0 !== iBot) {
            this.padding = [iTop, iRight, iTop, iRight];
        } else {
            this.padding = [iTop, iRight, iBot, iLeft];
        }
    },

    /**
     * Stores the initial placement of the dd element
     */
    setInitPosition: function(diffX, diffY) {
        var el = this.getEl();

        if (!this.DDM.verifyEl(el)) {
            this.logger.debug(this.id + " element is broken");
            return;
        }

        var dx = diffX || 0;
        var dy = diffY || 0;

        var p = YAHOO.util.Dom.getXY( el );

        this.initPageX = p[0] - dx;
        this.initPageY = p[1] - dy;

        this.lastPageX = p[0];
        this.lastPageY = p[1];

        this.logger.debug(this.id + " inital position: " + this.initPageX + 
                ", " + this.initPageY);

        this.setStartPosition(p);
    },

    /**
     * Sets the start position of the element.  This is set when the obj
     * is initialized, the reset when a drag is started.
     * @param pos current position (from previous lookup)
     * @private
     */
    setStartPosition: function(pos) {

        var p = pos || YAHOO.util.Dom.getXY( this.getEl() );

        this.startPageX = p[0];
        this.startPageY = p[1];
    },

    /**
     * Add this instance to a group of related drag/drop objects.  All 
     * instances belong to at least one group, and can belong to as many 
     * groups as needed.
     *
     * @param sGroup {string} the name of the group
     */
    addToGroup: function(sGroup) {
        this.groups[sGroup] = true;
        this.DDM.regDragDrop(this, sGroup);
    },

    /**
     * Allows you to specify that an element other than the linked element 
     * will be moved with the cursor during a drag
     *
     * @param id the id of the element that will be used to initiate the drag
     */
    setDragElId: function(id) {
        this.dragElId = id;
    },

    /**
     * Allows you to specify a child of the linked element that should be 
     * used to initiate the drag operation.  An example of this would be if 
     * you have a content div with text and links.  Clicking anywhere in the 
     * content area would normally start the drag operation.  Use this method
     * to specify that an element inside of the content div is the element 
     * that starts the drag operation.
     *
     * @param id the id of the element that will be used to initiate the drag
     */
    setHandleElId: function(id) {
        this.handleElId = id;
        this.DDM.regHandle(this.id, id);
    },

    /**
     * Allows you to set an element outside of the linked element as a drag 
     * handle
     */
    setOuterHandleElId: function(id) {
        this.logger.debug("Adding outer handle event: " + id);
        YAHOO.util.Event.addListener(id, "mousedown", 
                this.handleMouseDown, this, true);
        this.setHandleElId(id);
    },

    /**
     * Remove all drag and drop hooks for this element
     */
    unreg: function() {
        this.logger.debug("DragDrop obj cleanup " + this.id);
        YAHOO.util.Event.removeListener(this.id, "mousedown", 
                this.handleMouseDown);
        this._domRef = null;
        this.DDM._remove(this);
    },

    /**
     * Returns true if this instance is locked, or the drag drop mgr is locked
     * (meaning that all drag/drop is disabled on the page.)
     *
     * @return {boolean} true if this obj or all drag/drop is locked, else 
     * false
     */
    isLocked: function() {
        return (this.DDM.isLocked() || this.locked);
    },

    /**
     * Fired when this object is clicked
     *
     * @param {Event} e 
     * @param {YAHOO.util.DragDrop} oDD the clicked dd object (this dd obj)
     * @private
     */
    handleMouseDown: function(e, oDD) {

        this.logger.debug("isLocked: " + this.isLocked());

        var EU = YAHOO.util.Event;

        var button = e.which || e.button;
        this.logger.debug("button: " + button);

        if (this.primaryButtonOnly && button > 1) {
            this.logger.debug("Mousedown was not produced by the primary button");
            return;
        }

        if (this.isLocked()) {
            this.logger.debug("Drag and drop is disabled, aborting");
            return;
        }

        this.logger.debug("mousedown " + this.id);

        this.DDM.refreshCache(this.groups);

        // Only process the event if we really clicked within the linked 
        // element.  The reason we make this check is that in the case that 
        // another element was moved between the clicked element and the 
        // cursor in the time between the mousedown and mouseup events. When 
        // this happens, the element gets the next mousedown event 
        // regardless of where on the screen it happened.  
        var pt = new YAHOO.util.Point(EU.getPageX(e), EU.getPageY(e));
        if ( this.DDM.isOverTarget(pt, this) )  {

            this.logger.debug("click is over target");

            //  check to see if the handle was clicked
            var srcEl = EU.getTarget(e);

            if (this.isValidHandleChild(srcEl) &&
                    (this.id == this.handleElId || 
                     this.DDM.handleWasClicked(srcEl, this.id)) ) {

                this.logger.debug("click was a valid handle");

                // set the initial element position
                this.setStartPosition();

                this.logger.debug("firing onMouseDown events");


                this.b4MouseDown(e);
                this.onMouseDown(e);
                this.DDM.handleMouseDown(e, this);

                this.DDM.stopEvent(e);
            }
        }
    },

    /**
     * Allows you to specify a tag name that should not start a drag operation
     * when clicked.  This is designed to facilitate embedding links within a
     * drag handle that do something other than start the drag.
     * 
     * @param {string} tagName the type of element to exclude
     */
    addInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        this.invalidHandleTypes[type] = type;
    },

    /**
     * Lets you to specify an element id for a child of a drag handle
     * that should not initiate a drag
     * @param {string} id the element id of the element you wish to ignore
     */
    addInvalidHandleId: function(id) {
        this.invalidHandleIds[id] = id;
    },


    /**
     * Lets you specify a css class of elements that will not initiate a drag
     * @param {string} cssClass the class of the elements you wish to ignore
     */
    addInvalidHandleClass: function(cssClass) {
        this.invalidHandleClasses.push(cssClass);
    },

    /**
     * Unsets an excluded tag name set by addInvalidHandleType
     * 
     * @param {string} tagName the type of element to unexclude
     */
    removeInvalidHandleType: function(tagName) {
        var type = tagName.toUpperCase();
        // this.invalidHandleTypes[type] = null;
        delete this.invalidHandleTypes[type];
    },
    
    /**
     * Unsets an invalid handle id
     * @param {string} the id of the element to re-enable
     */
    removeInvalidHandleId: function(id) {
        delete this.invalidHandleIds[id];
    },

    /**
     * Unsets an invalid css class
     * @param {string} the class of the element(s) you wish to re-enable
     */
    removeInvalidHandleClass: function(cssClass) {
        for (var i=0, len=this.invalidHandleClasses.length; i<len; ++i) {
            if (this.invalidHandleClasses[i] == cssClass) {
                delete this.invalidHandleClasses[i];
            }
        }
    },

    /**
     * Checks the tag exclusion list to see if this click should be ignored
     *
     * @param {ygNode} node
     * @return {boolean} true if this is a valid tag type, false if not
     */
    isValidHandleChild: function(node) {
        // var type = node.nodeName;

        // if (type == "#text") {
            // // this.logger.debug("text node, getting parent node type");
            // type = node.parentNode.nodeName;
        // }

        var valid = true;
        var n = (node.nodeName == "#text") ? node.parentNode : node;
        valid = valid && !this.invalidHandleTypes[n.nodeName];
        valid = valid && !this.invalidHandleIds[n.id];

        for (var i=0, len=this.invalidHandleClasses.length; valid && i<len; ++i) {
            valid = !YAHOO.util.Dom.hasClass(n, this.invalidHandleClasses[i]);
        }

        this.logger.debug("Valid handle? ... " + valid);

        return valid;

        //return ( !(this.invalidHandleTypes[n.nodeName] || 
                    //this.invalidHandleIds[n.id]) );
    },

    /**
     * Create the array of horizontal tick marks if an interval was specified
     * in setXConstraint().
     *
     * @private
     */
    setXTicks: function(iStartX, iTickSize) {
        this.xTicks = [];
        this.xTickSize = iTickSize;
        
        var tickMap = {};

        for (var i = this.initPageX; i >= this.minX; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageX; i <= this.maxX; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.xTicks[this.xTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.xTicks.sort(this.DDM.numericSort) ;
        this.logger.debug("xTicks: " + this.xTicks.join());
    },

    /**
     * Create the array of vertical tick marks if an interval was specified in 
     * setYConstraint().
     *
     * @private
     */
    setYTicks: function(iStartY, iTickSize) {
        // this.logger.debug("setYTicks: " + iStartY + ", " + iTickSize
               // + ", " + this.initPageY + ", " + this.minY + ", " + this.maxY );
        this.yTicks = [];
        this.yTickSize = iTickSize;

        var tickMap = {};

        for (var i = this.initPageY; i >= this.minY; i = i - iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        for (i = this.initPageY; i <= this.maxY; i = i + iTickSize) {
            if (!tickMap[i]) {
                this.yTicks[this.yTicks.length] = i;
                tickMap[i] = true;
            }
        }

        this.yTicks.sort(this.DDM.numericSort) ;
        this.logger.debug("yTicks: " + this.yTicks.join());
    },

    /**
     * By default, the element can be dragged any place on the screen.  Use 
     * this method to limit the horizontal travel of the element.  Pass in 
     * 0,0 for the parameters if you want to lock the drag to the y axis.
     *
     * @param {int} iLeft the number of pixels the element can move to the left
     * @param {int} iRight the number of pixels the element can move to the 
     * right
     * @param {int} iTickSize optional parameter for specifying that the 
     * element
     * should move iTickSize pixels at a time.
     */
    setXConstraint: function(iLeft, iRight, iTickSize) {
        this.leftConstraint = iLeft;

        this.rightConstraint = iRight;

        this.minX = this.initPageX - iLeft;
        this.maxX = this.initPageX + iRight;
        if (iTickSize) { this.setXTicks(this.initPageX, iTickSize); }

        this.constrainX = true;
        this.logger.debug("initPageX:" + this.initPageX + " minX:" + this.minX + 
                " maxX:" + this.maxX);
    },

    /**
     * By default, the element can be dragged any place on the screen.  Set 
     * this to limit the vertical travel of the element.  Pass in 0,0 for the
     * parameters if you want to lock the drag to the x axis.
     *
     * @param {int} iUp the number of pixels the element can move up
     * @param {int} iDown the number of pixels the element can move down
     * @param {int} iTickSize optional parameter for specifying that the 
     * element should move iTickSize pixels at a time.
     */
    setYConstraint: function(iUp, iDown, iTickSize) {
        this.logger.debug("setYConstraint: " + iUp + "," + iDown + "," + iTickSize);
        this.topConstraint = iUp;
        this.bottomConstraint = iDown;

        this.minY = this.initPageY - iUp;
        this.maxY = this.initPageY + iDown;
        if (iTickSize) { this.setYTicks(this.initPageY, iTickSize); }

        this.constrainY = true;
        
        this.logger.debug("initPageY:" + this.initPageY + " minY:" + this.minY + 
                " maxY:" + this.maxY);
    },

    /**
     * resetConstraints must be called if you manually reposition a dd element.
     * @param {boolean} maintainOffset
     */
    resetConstraints: function() {

        this.logger.debug("resetConstraints");

        // Maintain offsets if necessary
        if (this.initPageX || this.initPageX === 0) {
            this.logger.debug("init pagexy: " + this.initPageX + ", " + 
                               this.initPageY);
            this.logger.debug("last pagexy: " + this.lastPageX + ", " + 
                               this.lastPageY);
            // figure out how much this thing has moved
            var dx = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0;
            var dy = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;

            this.setInitPosition(dx, dy);

        // This is the first time we have detected the element's position
        } else {
            this.setInitPosition();
        }

        if (this.constrainX) {
            this.setXConstraint( this.leftConstraint, 
                                 this.rightConstraint, 
                                 this.xTickSize        );
        }

        if (this.constrainY) {
            this.setYConstraint( this.topConstraint, 
                                 this.bottomConstraint, 
                                 this.yTickSize         );
        }
    },

    /**
     * Normally the drag element is moved pixel by pixel, but we can specify 
     * that it move a number of pixels at a time.  This method resolves the 
     * location when we have it set up like this.
     *
     * @param {int} val where we want to place the object
     * @param {int[]} tickArray sorted array of valid points
     * @return {int} the closest tick
     * @private
     */
    getTick: function(val, tickArray) {

        if (!tickArray) {
            // If tick interval is not defined, it is effectively 1 pixel, 
            // so we return the value passed to us.
            return val; 
        } else if (tickArray[0] >= val) {
            // The value is lower than the first tick, so we return the first
            // tick.
            return tickArray[0];
        } else {
            for (var i=0, len=tickArray.length; i<len; ++i) {
                var next = i + 1;
                if (tickArray[next] && tickArray[next] >= val) {
                    var diff1 = val - tickArray[i];
                    var diff2 = tickArray[next] - val;
                    return (diff2 > diff1) ? tickArray[i] : tickArray[next];
                }
            }

            // The value is larger than the last tick, so we return the last
            // tick.
            return tickArray[tickArray.length - 1];
        }
    },

    /**
     * toString method
     * @return {string} string representation of the dd obj
     */
    toString: function(val, tickArray) {
        return ("YAHOO.util.DragDrop {" + this.id + "}");
    }

};

/* Copyright (c) 2006 Yahoo! Inc. All rights reserved. */

// Only load the library once.  Rewriting the manager class would orphan 
// existing drag and drop instances.
if (!YAHOO.util.DragDropMgr) {

    /**
     * Handles the element interaction for all DragDrop items in the 
     * window.  Generally, you will not call this class directly, but it does
     * have helper methods that could be useful in your DragDrop 
     * implementations.  This class should not be instantiated; all methods 
     * are are static.
     *
     * @constructor
     */
    YAHOO.util.DragDropMgr = new function() {

        /**
         * Two dimensional Array of registered DragDrop objects.  The first 
         * dimension is the DragDrop item group, the second the DragDrop 
         * object.
         *
         * @type {string: string}
         * @private
         */
        this.ids = {};

        /**
         * Array of element ids defined as drag handles.  Used to determine 
         * if the element that generated the mousedown event is actually the 
         * handle and not the html element itself.
         *
         * @type {string: string}
         * @private
         */
        this.handleIds = {};

        /**
         * the DragDrop object that is currently being dragged
         *
         * @type DragDrop
         * @private
         **/
        this.dragCurrent = null;

        /**
         * the DragDrop object(s) that are being hovered over
         *
         * @type Array
         * @private
         */
        this.dragOvers = {};

        /**
         * @private
         */
        this.logger = null;

        /**
         * the X distance between the cursor and the object being dragged
         *
         * @type int
         * @private
         */
        this.deltaX = 0;

        /**
         * the Y distance between the cursor and the object being dragged
         *
         * @type int
         * @private
         */
        this.deltaY = 0;

        /**
         * Flag to determine if we should prevent the default behavior of the
         * events we define. By default this is true, but this can be set to 
         * false if you need the default behavior (not recommended)
         *
         * @type boolean
         */
        this.preventDefault = true;

        /**
         * Flag to determine if we should stop the propagation of the events 
         * we generate. This is true by default but you may want to set it to
         * false if the html element contains other features that require the
         * mouse click.
         *
         * @type boolean
         */
        this.stopPropagation = true;

        /**
         * @private
         */
        this.initalized = false;

        /**
         * All drag and drop can be disabled.
         *
         * @private
         */
        this.locked = false;
        
        /**
         * Called the first time an element is registered.
         *
         * @private
         */
        this.init = function() {
            this.logger = new ygLogger("DragDropMgr");
        };

        /**
         * In point mode, drag and drop interaction is defined by the 
         * location of the cursor during the drag/drop
         * @type int
         */
        this.POINT     = 0;

        /**
         * In intersect mode, drag and drop interactio nis defined by the 
         * overlap of two or more drag and drop objects.
         * @type int
         */
        this.INTERSECT = 1;

        /**
         * The current drag and drop mode.  Default it point mode
         * @type int
         */
        this.mode = this.POINT;

        /**
         * Runs method on all drag and drop objects
         * @private
         */
        this._execOnAll = function(sMethod, args) {
            for (var i in this.ids) {
                for (var j in this.ids[i]) {
                    var oDD = this.ids[i][j];
                    if (! this.isTypeOfDD(oDD)) {
                        continue;
                    }
                    oDD[sMethod].apply(oDD, args);
                }
            }
        };

        /**
         * Drag and drop initialization.  Sets up the global event handlers
         * @private
         */
        this._onLoad = function() {

            // Switched to onAvailable in 2.0.1 (in DragDrop.initTarget)
            // this._execOnAll("setInitPosition", []);

            this.logger = new ygLogger("DragDropMgr");
            this.logger.debug("DDM onload");

            var EU = YAHOO.util.Event;

            EU.on(document, "mouseup",   this.handleMouseUp, this, true);
            EU.on(document, "mousemove", this.handleMouseMove, this, true);
            EU.on(window,   "unload",    this._onUnload, this, true);
            EU.on(window,   "resize",    this._onResize, this, true);
            // EU.on(window,   "mouseout",    this._test);

            this.initalized = true;

        };

        /**
         * Reset constraints on all drag and drop objs
         * @private
         */
        this._onResize = function(e) {
            this.logger.debug("window resize");
            this._execOnAll("resetConstraints", []);
        };

        /**
         * Lock all drag and drop functionality
         */
        this.lock = function() { this.locked = true; };

        /**
         * Unlock all drag and drop functionality
         */
        this.unlock = function() { this.locked = false; };

        /**
         * Is drag and drop locked?
         *
         * @return {boolean} True if drag and drop is locked, false otherwise.
         */
        this.isLocked = function() { return this.locked; };

        /**
         * Location cache that is set for all drag drop objects when a drag is
         * initiated, cleared when the drag is finished.
         *
         * @private
         */
        this.locationCache = {};

        /**
         * Set useCache to false if you want to force object the lookup of each
         * drag and drop linked element constantly during a drag.
         * @type boolean
         */
        this.useCache = true;

        /**
         * The number of pixels that the mouse needs to move after the 
         * mousedown before the drag is initiated.  Default=3;
         * @type int
         */
        this.clickPixelThresh = 3;

        /**
         * The number of milliseconds after the mousedown event to initiate the
         * drag if we don't get a mouseup event. Default=1000
         * @type int
         */
        this.clickTimeThresh = 1000;

        /**
         * Flag that indicates that either the drag pixel threshold or the 
         * mousdown time threshold has been met
         * @type boolean
         * @private
         */
        this.dragThreshMet = false;

        /**
         * Timeout used for the click time threshold
         * @type Object
         * @private
         */
        this.clickTimeout = null;

        /**
         * The X position of the mousedown event stored for later use when a 
         * drag threshold is met.
         * @type int
         * @private
         */
        this.startX = 0;

        /**
         * The Y position of the mousedown event stored for later use when a 
         * drag threshold is met.
         * @type int
         * @private
         */
        this.startY = 0;

        /**
         * Each DragDrop instance must be registered with the DragDropMgr.  
         * This is executed in ygDragDrop.init()
         *
         * @param {DragDrop} oDD the DragDrop object to register
         * @param {String} sGroup the name of the group this element belongs to
         */
        this.regDragDrop = function(oDD, sGroup) {
            if (!this.initialized) { this.init(); }
            
            if (!this.ids[sGroup]) {
                this.ids[sGroup] = {};
            }
            this.ids[sGroup][oDD.id] = oDD;
        };

        /**
         * Unregisters a drag and drop item.  This is executed in 
         * ygDragDrop.unreg, use that method instead of calling this directly.
         * @private
         */
        this._remove = function(oDD) {
            for (var g in oDD.groups) {
                if (g && this.ids[g][oDD.id]) {
                    delete this.ids[g][oDD.id];
                }
            }
            delete this.handleIds[oDD.id];
        };

        /**
         * Each DragDrop handle element must be registered.  This is done
         * automatically when executing ygDragDrop.setHandleElId()
         *
         * @param {String} sDDId the DragDrop id this element is a handle for
         * @param {String} sHandleId the id of the element that is the drag 
         * handle
         */
        this.regHandle = function(sDDId, sHandleId) {
            if (!this.handleIds[sDDId]) {
                this.handleIds[sDDId] = {};
            }
            this.handleIds[sDDId][sHandleId] = sHandleId;
        };

        /**
         * Utility function to determine if a given element has been 
         * registered as a drag drop item.
         *
         * @param {String} id the element id to check
         * @return {boolean} true if this element is a DragDrop item, 
         * false otherwise
         */
        this.isDragDrop = function(id) {
            return ( this.getDDById(id) ) ? true : false;
        };

        /**
         * Returns the drag and drop instances that are in all groups the
         * passed in instance belongs to.
         *
         * @param {ygDragDrop} p_oDD the obj to get related data for
         * @param {boolean} bTargetsOnly if true, only return targetable objs
         * @return {ygDragDrop[]} the related instances
         */
        this.getRelated = function(p_oDD, bTargetsOnly) {
            var oDDs = [];
            for (var i in p_oDD.groups) {
                for (j in this.ids[i]) {
                    var dd = this.ids[i][j];
                    if (! this.isTypeOfDD(dd)) {
                        continue;
                    }
                    if (!bTargetsOnly || dd.isTarget) {
                        oDDs[oDDs.length] = dd;
                    }
                }
            }

            return oDDs;
        };

        /**
         * Returns true if the specified dd target is a legal target for 
         * the specifice drag obj
         *
         * @param {ygDragDrop} the drag obj
         * @param {ygDragDrop) the target
         * @return {boolean} true if the target is a legal target for the 
         * dd obj
         */
        this.isLegalTarget = function (oDD, oTargetDD) {
            var targets = this.getRelated(oDD);
            for (var i=0, len=targets.length;i<len;++i) {
                if (targets[i].id == oTargetDD.id) {
                    return true;
                }
            }

            return false;
        };

        /**
         * My goal is to be able to transparently determine if an object is
         * typeof ygDragDrop, and the exact subclass of ygDragDrop.  typeof 
         * returns "object", oDD.constructor.toString() always returns
         * "ygDragDrop" and not the name of the subclass.  So for now it just
         * evaluates a well-known variable in ygDragDrop.
         *
         * @param {Object} the object to evaluate
         * @return {boolean} true if typeof oDD = ygDragDrop
         */
        this.isTypeOfDD = function (oDD) {
            return (oDD && oDD.__ygDragDrop);
        };

        /**
         * Utility function to determine if a given element has been 
         * registered as a drag drop handle for the given Drag Drop object.
         *
         * @param {String} id the element id to check
         * @return {boolean} true if this element is a DragDrop handle, false 
         * otherwise
         */
        this.isHandle = function(sDDId, sHandleId) {
            return ( this.handleIds[sDDId] && 
                            this.handleIds[sDDId][sHandleId] );
        };

        /**
         * Returns the DragDrop instance for a given id
         *
         * @param {String} id the id of the DragDrop object
         * @return {DragDrop} the drag drop object, null if it is not found
         */
        this.getDDById = function(id) {
            for (var i in this.ids) {
                if (this.ids[i][id]) {
                    return this.ids[i][id];
                }
            }
            return null;
        };

        /**
         * Fired after a registered DragDrop object gets the mousedown event.
         * Sets up the events required to track the object being dragged
         *
         * @param {Event} e the event
         * @param oDD the DragDrop object being dragged
         * @private
         */
        this.handleMouseDown = function(e, oDD) {

            this.currentTarget = YAHOO.util.Event.getTarget(e);

            this.logger.debug("mousedown - adding event handlers");
            this.dragCurrent = oDD;

            var el = oDD.getEl();

            // track start position
            this.startX = YAHOO.util.Event.getPageX(e);
            this.startY = YAHOO.util.Event.getPageY(e);

            this.deltaX = this.startX - el.offsetLeft;
            this.deltaY = this.startY - el.offsetTop;

            this.dragThreshMet = false;

            this.clickTimeout = setTimeout( 
                    function() { 
                        var DDM = YAHOO.util.DDM;
                        DDM.startDrag(DDM.startX, DDM.startY); 
                    }, 
                    this.clickTimeThresh );
        };

        /**
         * Fired when either the drag pixel threshol or the mousedown hold 
         * time threshold has been met.
         * 
         * @param x {int} the X position of the original mousedown
         * @param y {int} the Y position of the original mousedown
         */
        this.startDrag = function(x, y) {
            this.logger.debug("firing drag start events");
            clearTimeout(this.clickTimeout);
            if (this.dragCurrent) {
                this.dragCurrent.b4StartDrag(x, y);
                this.dragCurrent.startDrag(x, y);
            }
            this.dragThreshMet = true;
        };

        /**
         * Internal function to handle the mouseup event.  Will be invoked 
         * from the context of the document.
         *
         * @param {Event} e the event
         * @private
         */
        this.handleMouseUp = function(e) {

            if (! this.dragCurrent) {
                return;
            }

            clearTimeout(this.clickTimeout);

            if (this.dragThreshMet) {
                this.logger.debug("mouseup detected - completing drag");
                this.fireEvents(e, true);
            } else {
                this.logger.debug("drag threshold not met");
            }

            this.stopDrag(e);

            this.stopEvent(e);
        };

        /**
         * Utility to stop event propagation and event default, if these 
         * features are turned on.
         *
         * @param {Event} e the event as returned by this.getEvent()
         */
        this.stopEvent = function(e) {
            if (this.stopPropagation) {
                YAHOO.util.Event.stopPropagation(e);
            }

            if (this.preventDefault) {
                YAHOO.util.Event.preventDefault(e);
            }
        };

        /** 
         * Internal function to clean up event handlers after the drag 
         * operation is complete
         *
         * @param {Event} e the event
         * @private
         */
        this.stopDrag = function(e) {
            // this.logger.debug("mouseup - removing event handlers");

            // Fire the drag end event for the item that was dragged
            if (this.dragCurrent) {
                if (this.dragThreshMet) {
                    this.logger.debug("firing endDrag events");
                    this.dragCurrent.b4EndDrag(e);
                    this.dragCurrent.endDrag(e);
                }

                this.logger.debug("firing onMouseUp event");
                this.dragCurrent.onMouseUp(e);
            }

            this.dragCurrent = null;
            this.dragOvers = {};
        };


        /** 
         * Internal function to handle the mousemove event.  Will be invoked 
         * from the context of the html element.
         *
         * @TODO figure out what we can do about mouse events lost when the 
         * user drags objects beyond the window boundary.  Currently we can 
         * detect this in internet explorer by verifying that the mouse is 
         * down during the mousemove event.  Firefox doesn't give us the 
         * button state on the mousemove event.
         *
         * @param {Event} e the event
         * @private
         */
        this.handleMouseMove = function(e) {
            if (! this.dragCurrent) {
                // this.logger.debug("no current drag obj");
                return;
            }

            // var button = e.which || e.button;
            // this.logger.debug("which: " + e.which + ", button: "+ e.button);

            // check for IE mouseup outside of page boundary
            if (YAHOO.util.Event.isIE && !e.button) {
                this.logger.debug("button failure");
                this.stopEvent(e);
                return this.handleMouseUp(e);
            }

            if (!this.dragThreshMet) {
                var diffX = Math.abs(this.startX - YAHOO.util.Event.getPageX(e));
                var diffY = Math.abs(this.startY - YAHOO.util.Event.getPageY(e));
                // this.logger.debug("diffX: " + diffX + "diffY: " + diffY);
                if (diffX > this.clickPixelThresh || 
                            diffY > this.clickPixelThresh) {
                    this.logger.debug("pixel threshold met");
                    this.startDrag(this.startX, this.startY);
                }
            }

            if (this.dragThreshMet) {
                this.dragCurrent.b4Drag(e);
                this.dragCurrent.onDrag(e);
                this.fireEvents(e, false);
            }

            this.stopEvent(e);
        };

        /**
         * Iterates over all of the DragDrop elements to find ones we are 
         * hovering over or dropping on
         *
         * @param {Event} e the event
         * @param {boolean} isDrop is this a drop op or a mouseover op?
         * @private
         */
        this.fireEvents = function(e, isDrop) {
            var dc = this.dragCurrent;

            // If the user did the mouse up outside of the window, we could 
            // get here even though we have ended the drag.
            if (!dc || dc.isLocked()) {
                return;
            }

            var x = YAHOO.util.Event.getPageX(e);
            var y = YAHOO.util.Event.getPageY(e);
            var pt = new YAHOO.util.Point(x,y);

            // cache the previous dragOver array
            var oldOvers = [];

            var outEvts   = [];
            var overEvts  = [];
            var dropEvts  = [];
            var enterEvts = [];

            // Check to see if the object we were hovering over is no longer 
            // being hovered over so we can fire the onDragOut event
            for (var i in this.dragOvers) {

                var ddo = this.dragOvers[i];

                if (! this.isTypeOfDD(ddo)) {
                    continue;
                }

                if (! this.isOverTarget(pt, ddo, this.mode)) {
                    outEvts.push( ddo );
                }

                oldOvers[i] = true;
                delete this.dragOvers[i];
            }

            for (var sGroup in dc.groups) {
                // this.logger.debug("Processing group " + sGroup);
                
                if ("string" != typeof sGroup) {
                    continue;
                }

                for (i in this.ids[sGroup]) {
                    var oDD = this.ids[sGroup][i];
                    if (! this.isTypeOfDD(oDD)) {
                        continue;
                    }

                    if (oDD.isTarget && !oDD.isLocked() && oDD != dc) {
                        if (this.isOverTarget(pt, oDD, this.mode)) {
                            // look for drop interactions
                            if (isDrop) {
                                dropEvts.push( oDD );
                            // look for drag enter and drag over interactions
                            } else {

                                // initial drag over: dragEnter fires
                                if (!oldOvers[oDD.id]) {
                                    enterEvts.push( oDD );
                                // subsequent drag overs: dragOver fires
                                } else {
                                    overEvts.push( oDD );
                                }

                                this.dragOvers[oDD.id] = oDD;
                            }
                        }
                    }
                }
            }

            if (this.mode) {
                if (outEvts.length) {
                    dc.b4DragOut(e, outEvts);
                    dc.onDragOut(e, outEvts);
                }

                if (enterEvts.length) {
                    dc.onDragEnter(e, enterEvts);
                }

                if (overEvts.length) {
                    dc.b4DragOver(e, overEvts);
                    dc.onDragOver(e, overEvts);
                }

                if (dropEvts.length) {
                    dc.b4DragDrop(e, dropEvts);
                    dc.onDragDrop(e, dropEvts);
                }

            } else {
                // fire dragout events
                var len = 0;
                for (i=0, len=outEvts.length; i<len; ++i) {
                    this.logger.debug(dc.id+" onDragOut: " + outEvts[i].id);
                    dc.b4DragOut(e, outEvts[i].id);
                    dc.onDragOut(e, outEvts[i].id);
                }
                 
                // fire enter events
                for (i=0,len=enterEvts.length; i<len; ++i) {
                    this.logger.debug(dc.id + " onDragEnter " + enterEvts[i].id);
                    // dc.b4DragEnter(e, oDD.id);
                    dc.onDragEnter(e, enterEvts[i].id);
                }
         
                // fire over events
                for (i=0,len=overEvts.length; i<len; ++i) {
                    this.logger.debug(dc.id + " onDragOver " + overEvts[i].id);
                    dc.b4DragOver(e, overEvts[i].id);
                    dc.onDragOver(e, overEvts[i].id);
                }

                // fire drop events
                for (i=0, len=dropEvts.length; i<len; ++i) {
                    this.logger.debug(dc.id + " dropped on " + dropEvts[i].id);
                    dc.b4DragDrop(e, dropEvts[i].id);
                    dc.onDragDrop(e, dropEvts[i].id);
                }

            }

        };

        /**
         * Helper function for getting the best match from the list of drag 
         * and drop objects returned by the drag and drop events when we are 
         * in INTERSECT mode.  It returns either the first object that the 
         * cursor is over, or the object that has the greatest overlap with 
         * the dragged element.
         *
         * @param  {ygDragDrop[]} dds The array of drag and drop objects 
         * targeted
         * @return {ygDragDrop}       The best single match
         */
        this.getBestMatch = function(dds) {
            var winner = null;
            // Return null if the input is not what we expect
            //if (!dds || !dds.length || dds.length == 0) {
               // winner = null;
            // If there is only one item, it wins
            //} else if (dds.length == 1) {

            var len = dds.length;

            if (len == 1) {
                winner = dds[0];
            } else {
                // Loop through the targeted items
                for (var i=0; i<len; ++i) {
                    var dd = dds[i];
                    // If the cursor is over the object, it wins.  If the 
                    // cursor is over multiple matches, the first one we come
                    // to wins.
                    if (dd.cursorIsOver) {
                        winner = dd;
                        break;
                    // Otherwise the object with the most overlap wins
                    } else {
                        if (!winner || 
                            winner.overlap.getArea() < dd.overlap.getArea()) {
                            winner = dd;
                        }
                    }
                }
            }

            return winner;
        };

        /**
         * Refreshes the cache of the top-left and bottom-right points of the 
         * drag and drop objects in the specified groups
         *
         * @param {Array} aGroups an associative array of groups to refresh
         */
        this.refreshCache = function(aGroups) {
            this.logger.debug("refreshing element location cache");
            for (sGroup in aGroups) {
                if ("string" != typeof sGroup) {
                    continue;
                }
                for (i in this.ids[sGroup]) {
                    var oDD = this.ids[sGroup][i];

                    if (this.isTypeOfDD(oDD)) {
                        var loc = this.getLocation(oDD);
                        if (loc) {
                            this.locationCache[oDD.id] = loc;
                        } else {
                            delete this.locationCache[oDD.id];
                            this.logger.debug("something is wrong with the element");
                            // this will unregister the drag and drop object if
                            // the element is not in a usable state
                            oDD.unreg();
                        }
                    }
                }
            }
        };

        /**
         * This checks to make sure an element exists and is in the DOM.  The
         * main purpose is to handle cases where innerHTML is used to remove
         * drag and drop objects from the DOM.  IE provides an 'unspecified
         * error' when trying to access the offsetParent of such an element
         * @param {HTMLElement} el the element to check
         * @return {boolean} true if the element looks usable
         */
        this.verifyEl = function(el) {
            try {
                if (el) {
                    var parent = el.offsetParent;
                    if (parent) {
                        return true;
                    }
                }
            } catch(e) {
                this.logger.debug("detected problem with an element");
            }

            return false;
        };
        
        /**
         * Returns the an array containing the drag and drop element's position
         * and size, including the ygDragDrop.padding configured for it
         *
         * @param {ygDragDrop} oDD the drag and drop object to get the 
         * location for
         * @return array containing the top left and bottom right points of the 
         * element 
         */
        this.getLocation = function(oDD) {
            if (! this.isTypeOfDD(oDD)) {
                this.logger.debug(oDD + " is not a DD obj");
                return null;
            }

            var el = oDD.getEl();

            if (!this.verifyEl(el)) {
                this.logger.debug(oDD + " element is not usable");
                return null;
            }

            // this.logger.debug(oDD.id + " padding: " + oDD.padding);

            // var aPos = ygPos.getPos(el);
            var aPos = YAHOO.util.Dom.getXY(el);

            x1 = aPos[0];
            x2 = x1 + el.offsetWidth;

            y1 = aPos[1];
            y2 = y1 + el.offsetHeight;

            var t = y1 - oDD.padding[0];
            var r = x2 + oDD.padding[1];
            var b = y2 + oDD.padding[2];
            var l = x1 - oDD.padding[3];

            return new YAHOO.util.Region( t, r, b, l );

        };

        /**
         * Checks the cursor location to see if it over the target
         * 
         * @param {YAHOO.util.Point} pt The point to evaluate
         * @param {ygDragDrop} oDDTarget the DragDrop object we are inspecting
         * @return {boolean} true if the mouse is over the target
         * @private
         */
        this.isOverTarget = function(pt, oDDTarget, intersect) {
            // use cache if available
            var loc = this.locationCache[oDDTarget.id];
            if (!loc || !this.useCache) {
                this.logger.debug("cache not populated");
                loc = this.getLocation(oDDTarget);
                this.locationCache[oDDTarget.id] = loc;

                this.logger.debug("cache: " + loc);
            }

            // this.logger.debug("isOverTarget: " + x + "," + y + ", " + loc);

            // var cursorIsOver =  (x >= loc[3] && x <= loc[1] && y >= loc[0] && y <= loc[2]);
            //oDDTarget.cursorIsOver = loc.contains( new YAHOO.util.Point(x, y) );
            oDDTarget.cursorIsOver = loc.contains( pt );
            oDDTarget.overlap = null;

            // if (this.INTERSECT == this.mode) {
            if (intersect) {

                // var curRegion = 
                  //   YAHOO.util.Region.getRegion(
                  //   this.dragCurrent.getDragEl());
                //this.logger.debug("pt: " + pt + "dc: " + this.dragCurrent.diffX + ", " + this.dragCurrent.diffY )
                var el = this.dragCurrent.getDragEl();
                var x = pt.x - this.dragCurrent.deltaX;
                var y = pt.y - this.dragCurrent.deltaY;
                var curRegion = new YAHOO.util.Region( y, x + el.offsetWidth,
                                                       y + el.offsetHeight, x );

                var overlap = curRegion.intersect(loc);

                if (overlap) {
                    oDDTarget.overlap = overlap;
                    return true;
                } else {
                    return false;
                }

            } else {
                return oDDTarget.cursorIsOver;
            }
        };

        /**
         * @private
         */
        this._onUnload = function(e, me) {
            this.unregAll();
        };

        /**
         * Cleans up the drag and drop events and objects.
         *
         * @private
         */
        this.unregAll = function() {
            this.logger.debug("unregister all");

            if (this.dragCurrent) {
                this.stopDrag();
                this.dragCurrent = null;
            }

            this._execOnAll("unreg", []);

            for (i in this.elementCache) {
                delete this.elementCache[i];
            }

            this.elementCache = {};
            this.ids = {};
        };

        /**
         * A cache of DOM elements
         *
         * @private
         */
        this.elementCache = {};
        
        /**
         * Get the wrapper for the DOM element specified
         *
         * @param {String} id the id of the elment to get
         * @return {YAHOO.util.DDM.ElementWrapper} the wrapped element
         * @private
         */
        this.getElWrapper = function(id) {
            var oWrapper = this.elementCache[id];
            if (!oWrapper || !oWrapper.el) {
                // this.logger.debug("adding element cache: " + id);
                oWrapper = this.elementCache[id] = 
                    new this.ElementWrapper(document.getElementById(id));
            }
            return oWrapper;
        };

        /**
         * Returns the actual DOM element
         *
         * @param {String} id the id of the elment to get
         * @return {Object} The element
         */
        this.getElement = function(id) {
            // return this.getElWrapper(id).el;
            return document.getElementById(id);
        };
        
        /**
         * Returns the style property for the DOM element (i.e., 
         * document.getElById(id).style)
         *
         * @param {String} id the id of the elment to get
         * @return {Object} The style property of the element
         */
        this.getCss = function(id) {
            // return this.getElWrapper(id).css;
            var css = null;
            var el = document.getElementById(id);
            if (el) {
                css = el.style;
            }

            return css;
        };

        /**
         * Inner class for cached elements
         */
        this.ElementWrapper = function(el) {
                /**
                 * @private
                 */
                this.el = el || null;
                /**
                 * @private
                 */
                this.id = this.el && el.id;
                /**
                 * @private
                 */
                this.css = this.el && el.style;
            };

        /**
         * Returns the X position of an html element
         * @param el the element for which to get the position
         * @return {int} the X coordinate
         */
        this.getPosX = function(el) {
            return YAHOO.util.Dom.getX(el);
        };

        /**
         * Returns the Y position of an html element
         * @param el the element for which to get the position
         * @return {int} the Y coordinate
         */
        this.getPosY = function(el) {
            return YAHOO.util.Dom.getY(el); 
        };

        /**
         * Swap two nodes.  In IE, we use the native method, for others we 
         * emulate the IE behavior
         *
         * @param n1 the first node to swap
         * @param n2 the other node to swap
         */
        this.swapNode = function(n1, n2) {
            if (n1.swapNode) {
                n1.swapNode(n2);
            } else {
                // the node reference order for the swap is a little tricky. 
                var p = n2.parentNode;
                var s = n2.nextSibling;
                n1.parentNode.replaceChild(n2, n1);
                p.insertBefore(n1,s);
            }
        };

        /**
         * @private
         */
        this.getScroll = function () {
            var t, l;
            if (document.documentElement && document.documentElement.scrollTop) {
                t = document.documentElement.scrollTop;
                l = document.documentElement.scrollLeft;
            } else if (document.body) {
                t = document.body.scrollTop;
                l = document.body.scrollLeft;
            }
            return { top: t, left: l };
        };

        /**
         * Returns the specified element style property
         * @param {HTMLElement} el          the element
         * @param {string}      styleProp   the style property
         * @return {string}     The value of the style property
         * @deprecated, use YAHOO.util.Dom.getStyle
         */
        this.getStyle = function(el, styleProp) {
            return YAHOO.util.Dom.getStyle(el, styleProp);
        };

        /**
         * Gets the scrollTop
         *
         * @return {int} the document's scrollTop
         */
        this.getScrollTop = function () { return this.getScroll().top; };

        /**
         * Gets the scrollLeft
         *
         * @return {int} the document's scrollTop
         */
        this.getScrollLeft = function () { return this.getScroll().left; };

        this.moveToEl = function (moveEl, targetEl) {
            var aCoord = YAHOO.util.Dom.getXY(targetEl);
            this.logger.debug("moveToEl: " + aCoord);
            YAHOO.util.Dom.setXY(moveEl, aCoord);
        };

        /**
         * Gets the client height
         *
         * @return {int} client height in px
         */
        this.getClientHeight = function() {
            return (window.innerHeight) ? window.innerHeight : 
                (document.documentElement && document.documentElement.clientHeight) ?
                document.documentElement.clientHeight : document.body.offsetHeight;
        };

        /**
         * Gets the client width
         *
         * @return {int} client width in px
         */
        this.getClientWidth = function() {
            return (window.innerWidth) ? window.innerWidth : 
                (document.documentElement && document.documentElement.clientWidth) ?
                document.documentElement.clientWidth : document.body.offsetWidth;
        };

        /**
         * numeric array sort function
         */
        this.numericSort = function(a, b) { return (a - b); };

        /**
         * @private
         */
        this._timeoutCount = 0;

        /**
         * @private
         * Trying to make the load order less important.  Without this we get
         * an error if this file is loaded before the Event Utility.
         */
        this._addListeners = function() {
            if ( YAHOO.util.Event && document ) {
                this._onLoad();
            } else {
                if (this._timeoutCount > 1000) {
                    this.logger.debug("DragDrop requires the Event Utility");
                } else {
                    setTimeout(YAHOO.util.DDM._addListeners, 10);
                    if (document && document.body) {
                        this._timeoutCount += 1;
                    }
                }
            }
        };

        /**
         * Recursively searches the immediate parent and all child nodes for 
         * the handle element in order to determine wheter or not it was 
         * clicked.
         *
         * @param node the html element to inspect
         */
        this.handleWasClicked = function(node, id) {
            if (this.isHandle(id, node.id)) {
                this.logger.debug("clicked node is a handle");
                return true;
            } else {
                // check to see if this is a text node child of the one we want
                var p = node.parentNode;
                // this.logger.debug("p: " + p);

                while (p) {
                    if (this.isHandle(id, p.id)) {
                        return true;
                    } else {
                        this.logger.debug(p.id + " is not a handle");
                        p = p.parentNode;
                    }
                }
            }

            return false;
        };

    } ();

    // shorter alias, save a few bytes
    YAHOO.util.DDM = YAHOO.util.DragDropMgr;
    YAHOO.util.DDM._addListeners();

}

/* Copyright (c) 2006 Yahoo! Inc. All rights reserved. */

/**
 * A DragDrop implementation where the linked element follows the 
 * mouse cursor during a drag.
 *
 * @extends YAHOO.util.DragDrop
 * @constructor
 * @param {String} id the id of the linked element 
 * @param {String} sGroup the group of related DragDrop items
 */
YAHOO.util.DD = function(id, sGroup) {
    if (id) {
        this.init(id, sGroup);
        this.logger.setModuleName("DD");
    }
};

YAHOO.util.DD.prototype = new YAHOO.util.DragDrop();

/**
 * When set to true, the utility automatically tries to scroll the browser
 * window wehn a drag and drop element is dragged near the viewport boundary.
 * Defaults to true.
 *
 * @type boolean
 */
YAHOO.util.DD.prototype.scroll = true; 

/**
 * Sets the pointer offset to the distance between the linked element's top 
 * left corner and the location the element was clicked
 *
 * @param {int} iPageX the X coordinate of the click
 * @param {int} iPageY the Y coordinate of the click
 */
YAHOO.util.DD.prototype.autoOffset = function(iPageX, iPageY) {
    var el = this.getEl();
    var aCoord = YAHOO.util.Dom.getXY(el);
    var x = iPageX - aCoord[0];
    var y = iPageY - aCoord[1];
    this.setDelta(x, y);
    this.logger.debug("autoOffset el pos: " + aCoord + ", delta: " + x + "," + y);
};

/** 
 * Sets the pointer offset.  You can call this directly to force the offset to
 * be in a particular location (e.g., pass in 0,0 to set it to the center of the
 * object, as done in YAHOO.widget.Slider)
 *
 * @param {int} iDeltaX the distance from the left
 * @param {int} iDeltaY the distance from the top
 */
YAHOO.util.DD.prototype.setDelta = function(iDeltaX, iDeltaY) {
    this.deltaX = iDeltaX;
    this.deltaY = iDeltaY;
    this.logger.debug("deltaX:" + this.deltaX + ", deltaY:" + this.deltaY);
};

/**
 * Sets the drag element to the location of the mousedown or click event, 
 * maintaining the cursor location relative to the location on the element 
 * that was clicked.  Override this if you want to place the element in a 
 * location other than where the cursor is.
 *
 * @param {int} iPageX the X coordinate of the mousedown or drag event
 * @param {int} iPageY the Y coordinate of the mousedown or drag event
 */

YAHOO.util.DD.prototype.setDragElPos = function(iPageX, iPageY) {
    // the first time we do this, we are going to check to make sure
    // the element has css positioning

    var el = this.getDragEl();

    // if (!this.cssVerified) {
        // var pos = el.style.position;
        // this.logger.debug("drag element position: " + pos);
    // }

    this.alignElWithMouse(el, iPageX, iPageY);
};

/**
 * Sets the element to the location of the mousedown or click event, 
 * maintaining the cursor location relative to the location on the element 
 * that was clicked.  Override this if you want to place the element in a 
 * location other than where the cursor is.
 *
 * @param {HTMLElement} el the element to move
 * @param {int} iPageX the X coordinate of the mousedown or drag event
 * @param {int} iPageY the Y coordinate of the mousedown or drag event
 */
YAHOO.util.DD.prototype.alignElWithMouse = function(el, iPageX, iPageY) {
    var oCoord = this.getTargetCoord(iPageX, iPageY);
    var aCoord = [oCoord.x, oCoord.y];
    // this.logger.debug("****alignElWithMouse : " + el.id + ", " + aCoord + ", " + el.style.display);
    YAHOO.util.Dom.setXY(el, aCoord);

    this.cachePosition(oCoord.x, oCoord.y);

    this.autoScroll(oCoord.x, oCoord.y, el.offsetHeight, el.offsetWidth);
};

/**
 * Saves the most recent position so that we can reset the constraints and
 * tick marks on-demand.  We need to know this so that we can calculate the
 * number of pixels the element is offset from its original position.
 */
YAHOO.util.DD.prototype.cachePosition = function(iPageX, iPageY) {
    if (iPageX) {
        this.lastPageX = iPageX;
        this.lastPageY = iPageY;
    } else {
        var aCoord = YAHOO.util.Dom.getXY(this.getEl());
        this.lastPageX = aCoord[0];
        this.lastPageY = aCoord[1];
    }
};

/**
 * Auto-scroll the window if the dragged object has been moved beyond the 
 * visible window boundary.
 *
 * @param {int} x the drag element's x position
 * @param {int} y the drag element's y position
 * @param {int} h the height of the drag element
 * @param {int} w the width of the drag element
 * @private
 */
YAHOO.util.DD.prototype.autoScroll = function(x, y, h, w) {

    if (this.scroll) {
        // The client height
        var clientH = this.DDM.getClientHeight();

        // The client width
        var clientW = this.DDM.getClientWidth();

        // The amt scrolled down
        var st = this.DDM.getScrollTop();

        // The amt scrolled right
        var sl = this.DDM.getScrollLeft();

        // Location of the bottom of the element
        var bot = h + y;

        // Location of the right of the element
        var right = w + x;

        // The distance from the cursor to the bottom of the visible area, 
        // adjusted so that we don't scroll if the cursor is beyond the
        // element drag constraints
        var toBot = (clientH + st - y - this.deltaY);

        // The distance from the cursor to the right of the visible area
        var toRight = (clientW + sl - x - this.deltaX);

        // this.logger.debug( " x: " + x + " y: " + y + " h: " + h + 
        // " clientH: " + clientH + " clientW: " + clientW + 
        // " st: " + st + " sl: " + sl + " bot: " + bot + 
        // " right: " + right + " toBot: " + toBot + " toRight: " + toRight);

        // How close to the edge the cursor must be before we scroll
        // var thresh = (document.all) ? 100 : 40;
        var thresh = 40;

        // How many pixels to scroll per autoscroll op.  This helps to reduce 
        // clunky scrolling. IE is more sensitive about this ... it needs this 
        // value to be higher.
        var scrAmt = (document.all) ? 80 : 30;

        // Scroll down if we are near the bottom of the visible page and the 
        // obj extends below the crease
        if ( bot > clientH && toBot < thresh ) { 
            window.scrollTo(sl, st + scrAmt); 
        }

        // Scroll up if the window is scrolled down and the top of the object
        // goes above the top border
        if ( y < st && st > 0 && y - st < thresh ) { 
            window.scrollTo(sl, st - scrAmt); 
        }

        // Scroll right if the obj is beyond the right border and the cursor is
        // near the border.
        if ( right > clientW && toRight < thresh ) { 
            window.scrollTo(sl + scrAmt, st); 
        }

        // Scroll left if the window has been scrolled to the right and the obj
        // extends past the left border
        if ( x < sl && sl > 0 && x - sl < thresh ) { 
            window.scrollTo(sl - scrAmt, st);
        }
    }
};

/**
 * Finds the location the element should be placed if we want to move
 * it to where the mouse location less the click offset would place us.
 *
 * @param {int} iPageX the X coordinate of the click
 * @param {int} iPageY the Y coordinate of the click
 * @return an object that contains the coordinates (Object.x and Object.y)
 * @private
 */
YAHOO.util.DD.prototype.getTargetCoord = function(iPageX, iPageY) {

    // this.logger.debug("getTargetCoord: " + iPageX + ", " + iPageY);

    var x = iPageX - this.deltaX;
    var y = iPageY - this.deltaY;

    if (this.constrainX) {
        if (x < this.minX) { x = this.minX; }
        if (x > this.maxX) { x = this.maxX; }
    }

    if (this.constrainY) {
        if (y < this.minY) { y = this.minY; }
        if (y > this.maxY) { y = this.maxY; }
    }

    x = this.getTick(x, this.xTicks);
    y = this.getTick(y, this.yTicks);

    // this.logger.debug("getTargetCoord " + 
            // " iPageX: " + iPageX +
            // " iPageY: " + iPageY +
            // " x: " + x + ", y: " + y);

    return {x:x, y:y};
};

/** 
 * Event that fires prior to the onMouseDown event.  Overrides 
 * YAHOO.util.DragDrop.
 */
YAHOO.util.DD.prototype.b4MouseDown = function(e) {
    // this.resetConstraints();
    this.autoOffset(YAHOO.util.Event.getPageX(e), 
                        YAHOO.util.Event.getPageY(e));
};

/** 
 * Event that fires prior to the onDrag event.  Overrides 
 * YAHOO.util.DragDrop.
 */
YAHOO.util.DD.prototype.b4Drag = function(e) {
    this.setDragElPos(YAHOO.util.Event.getPageX(e), 
                        YAHOO.util.Event.getPageY(e));
};


///////////////////////////////////////////////////////////////////////////////
// Debugging ygDragDrop events that can be overridden
///////////////////////////////////////////////////////////////////////////////
/*
YAHOO.util.DD.prototype.startDrag = function(x, y) {
    this.logger.debug(this.id.toString()  + " startDrag");
};

YAHOO.util.DD.prototype.onDrag = function(e) {
    this.logger.debug(this.id.toString() + " onDrag");
};

YAHOO.util.DD.prototype.onDragEnter = function(e, id) {
    this.logger.debug(this.id.toString() + " onDragEnter: " + id);
};

YAHOO.util.DD.prototype.onDragOver = function(e, id) {
    this.logger.debug(this.id.toString() + " onDragOver: " + id);
};

YAHOO.util.DD.prototype.onDragOut = function(e, id) {
    this.logger.debug(this.id.toString() + " onDragOut: " + id);
};

YAHOO.util.DD.prototype.onDragDrop = function(e, id) {
    this.logger.debug(this.id.toString() + " onDragDrop: " + id);
};

YAHOO.util.DD.prototype.endDrag = function(e) {
    this.logger.debug(this.id.toString() + " endDrag");
};
*/

/* Copyright (c) 2006 Yahoo! Inc. All rights reserved. */

/**
 * A DragDrop implementation that inserts an empty, bordered div into
 * the document that follows the cursor during drag operations.  At the time of
 * the click, the frame div is resized to the dimensions of the linked html
 * element, and moved to the exact location of the linked element.
 *
 * References to the "frame" element refer to the single proxy element that
 * was created to be dragged in place of all DDProxy elements on the
 * page.
 *
 * @extends YAHOO.util.DD
 * @constructor
 * @param {String} id the id of the linked html element
 * @param {String} sGroup the group of related DragDrop objects
 */
YAHOO.util.DDProxy = function(id, sGroup) {
    if (id) {
        this.forceCssPosition = false;

        this.init(id, sGroup);
        this.initFrame(); 
        this.logger.setModuleName("DDProxy");
    }
};

YAHOO.util.DDProxy.prototype = new YAHOO.util.DD();

/**
 * A reference to the one proxy div element we create for all instances of this 
 * class
 *
 * @type HTMLElement
 */
YAHOO.util.DDProxy.frameDiv = null;

/**
 * the drag frame div id
 *
 * @type String
 */
YAHOO.util.DDProxy.dragElId = "ygddfdiv";

/**
 * The border width of the frame.  This is used when we resize the frame to
 * the size of the linked element.  We substract the border width to make
 * the div the correct size.
 *
 * @TODO find a better way to handle this
 *
 * @type int
 */
YAHOO.util.DDProxy.prototype.borderWidth = 2;

/**
 * By default we resize the drag frame to be the same size as the element
 * we want to drag (this is to get the frame effect).  We can turn it off
 * if we want a different behavior (ex: ygDDMy2)
 *
 * @type boolean
 */
YAHOO.util.DDProxy.prototype.resizeFrame = true;

/**
 * By default the frame is positioned exactly where the drag element is, so
 * we use the cursor offset provided by YAHOO.util.DD.  Another option that works only if
 * you do not have constraints on the obj is to have the drag frame centered
 * around the cursor.  Set centerFrame to true for this effect.  Ex: 
 * ygDDMy2
 *
 * @type boolean
 */
YAHOO.util.DDProxy.prototype.centerFrame = false;

/**
 * Create the drag frame if needed
 */
YAHOO.util.DDProxy.createFrame = function() {
    var THIS = YAHOO.util.DDProxy;

    if (!document || !document.body) {
        setTimeout(THIS.createFrame, 50);
        return;
    }

    if (!THIS.frameDiv) {
        THIS.frameDiv = document.createElement("div");
        THIS.frameDiv.id = THIS.dragElId;
        var s = THIS.frameDiv.style;
        s.position = "absolute";
        s.visibility = "hidden";
        s.cursor = "move";
        s.border = "2px solid #aaa";
        s.zIndex = 999;
        document.body.appendChild(THIS.frameDiv);

    }
};

/**
 * Initialization for the drag frame element.  Must be called in the
 * constructor of all subclasses
 */
YAHOO.util.DDProxy.prototype.initFrame = function() {
    YAHOO.util.DDProxy.createFrame();
    this.setDragElId(YAHOO.util.DDProxy.dragElId);
    this.useAbsMath = true;

};

/**
 * Resizes the drag frame to the dimensions of the clicked object, positions 
 * it over the object, and finally displays it
 *
 * @param {int} iPageX X click position
 * @param {int} iPageY Y click position
 * @private
 */
YAHOO.util.DDProxy.prototype.showFrame = function(iPageX, iPageY) {
    var el = this.getEl();

    var s = this.getDragEl().style;

    if (this.resizeFrame) {
        s.width = (parseInt(el.offsetWidth, 10) - (2*this.borderWidth)) + "px";
        s.height = (parseInt(el.offsetHeight, 10) - (2*this.borderWidth)) + "px";
    }

    if (this.centerFrame) {
        this.setDelta(Math.round(parseInt(s.width, 10)/2), 
                Math.round(parseInt(s.width, 10)/2));
    }

    this.setDragElPos(iPageX, iPageY);

    s.visibility = "";
};

// overrides YAHOO.util.DragDrop
YAHOO.util.DDProxy.prototype.b4MouseDown = function(e) {
    var x = YAHOO.util.Event.getPageX(e);
    var y = YAHOO.util.Event.getPageY(e);
    this.autoOffset(x, y);
    this.setDragElPos(x, y);
};

// overrides YAHOO.util.DragDrop
YAHOO.util.DDProxy.prototype.b4StartDrag = function(x, y) {
    // show the drag frame
    this.logger.debug("start drag show frame, x: " + x + ", y: " + y);
    this.showFrame(x, y);
};

// overrides YAHOO.util.DragDrop
YAHOO.util.DDProxy.prototype.b4EndDrag = function(e) {
    this.logger.debug(this.id + " b4EndDrag");

    // hide the drag frame
    var s = this.getDragEl().style;
    s.visibility = "hidden";
};

// overrides YAHOO.util.DragDrop
// By default we try to move the element to the last location of the frame.  
// This is so that the default behavior mirrors that of YAHOO.util.DD.  
YAHOO.util.DDProxy.prototype.endDrag = function(e) {
    this.logger.debug(this.id + " endDrag");
    var lel = this.getEl();
    var del = this.getDragEl();

    // Show the drag frame briefly so we can get its position
    del.style.visibility = "";

    // Hide the linked element before the move to get around a Safari 
    // rendering bug.
    lel.style.visibility = "hidden";
    YAHOO.util.DDM.moveToEl(lel, del);
    del.style.visibility = "hidden";
    lel.style.visibility = "";
};

/* Copyright (c) 2006 Yahoo! Inc. All rights reserved. */

/**
 * A DragDrop implementation that does not move, but can be a drop 
 * target.  You would get the same result by simply omitting implementation 
 * for the event callbacks, but this way we reduce the processing cost of the 
 * event listener and the callbacks.
 *
 * @extends YAHOO.util.DragDrop 
 * @constructor
 * @param {String} id the id of the element that is a drop target
 * @param {String} sGroup the group of related DragDrop objects
 */
 
YAHOO.util.DDTarget = function(id, sGroup) {
    if (id) {
        this.initTarget(id, sGroup);
        this.logger.setModuleName("DDTarget");
    }
};

YAHOO.util.DDTarget.prototype = new YAHOO.util.DragDrop();

