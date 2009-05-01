/**
 * @fileoverview Canvas tools for google maps. The first object is
 * to create arrows on google maps.
 * @author frank2008cn@gmail.com (Xiaoxi Wu)
 */

(function(){

   function getRGB(color, isRGBa, opacity) {
     var r = parseInt(color.substr(1, 2), 16);
     var g = parseInt(color.substr(3, 2), 16);
     var b = parseInt(color.substr(5, 2), 16);
     if (isRGBa) {
       return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
     }
     return "rgb(" + r + ", " + g + ", " + b + ")";
   }

   function getDivideBezuer(p0, p1, p2, p3, t1, t2) {
     var p03 = getBtBezuer(p0, p1, p2, p3, t1);
     var p04 = getBtBezuer(p0, p1, p2, p3, t2);
     var p21 = (1 - t1) * p2 + t1 * p3;
     var p12 = (1 - t1) * (1 - t1) * p1 + 2 * t1 * (1 - t1) * p2 + t1 * t1 * p3;
     var tp = (t2 - t1) / (1 - t1);
     var p01p = (1 - tp) * p03 + tp * p12;
     var p02p = (1 - tp) * (1 - tp) * p03 + 2 * tp * (1 - tp) * p12 + tp * tp * p21;
     return [p03, p01p, p02p, p04];
   }

   function getPointInLine(s, so, e, eo, x, width) {
     if (s > e) {
       var tmp = s;
       s = e;
       e = tmp;
       tmp = so;
       so = eo;
       eo = tmp;
     }
     var l = null;
     var lo = null;
     var r = null;
     var ro = null;
     if (s < x && e > x) {
       l = x;
       if (e > x + width) {
         r = x + width;
       } else {
         r = e;
         ro = eo;
       }
     } else if (s >= x && s < x + width) {
       l = s;
       lo = so;
       if (e > x + width) {
         r = x + width;
       } else {
         r = e;
         ro = eo;
       }
     } else {
       return null;
     }
     return [l, lo, r, ro];
   }

   function getLineInRect(sx, sy, ex, ey, rect) {
     if (rect) {
       var lr = getPointInLine(sx, sy, ex, ey, rect.x, rect.width);
       var lx = null;
       var ly = null;
       var rx = null;
       var ry = null;
       if (lr != null) {
         if (lr[1] == null) {
           lr[1] = (ey * (lr[0] - sx) + (ex - lr[0]) * sy) / (ex - sx);
         }
         if ((lr[1] >= sy && lr[1] <= ey) || (lr[1] <=sy && lr[1] >= ey)) {
           lx = lr[0];
           ly = lr[1];
         }
         if (lr[3] == null) {
           lr[3] = (ey * (lr[2] - sx) + (ex - lr[2]) * sy) / (ex - sx);
         }
         if ((lr[3] >= sy && lr[3] <= ey) && (lr[3] <= sy && lr[3] >=ey)) {
           if (lx != null && lr[2] != lx) {
             rx = lr[2];
             ry = lr[3];
           }/* else if (lx == null) {
             lx = lr[2];
             ly = lr[3];
           }*/
         }

         var tb = getPointInLine(sy, sx, ey, ex, rect.y, rect.height);
         if (tb != null) {
           if (tb[1] == null) {
             tb[1] = (ex * (tb[0] - sy) + (ey - tb[0]) * sx) / (ey - sy);
           }
           if (tb[3] == null) {
             tb[3] = (ex * (tb[2] - sy) + (ey - tb[2]) * sx) / (ey - sy);
           }

           if (tb[1] > tb[3]) {
             var tmp = tb[1];
             tb[1] = tb[3];
             tb[3] = tmp;
             tmp = tb[0];
             tb[0] = tb[2];
             tb[2] = tmp;
           }

           if ((tb[1] >= sx && tb[1] <= ex) || (tb[1] <= sx && tb[1] >= ex)) {
             if (lx == null || tb[1] > lx) {
               lx = tb[1];
               ly = tb[0];
             }
           }
           if (rx == null || tb[3] < rx) {
             rx = tb[3];
             ry = tb[2];
           }
         }
       }
       if (lx != null && rx != null) {
         return [lx, ly, rx, ry];
       }
     }
     return null;
   }

   function drawDotLine(sx, sy, ex, ey, ctx, rect) {
     rect.x = 0;
     rect.y = 0;
     var points = getLineInRect(sx, sy, ex, ey, rect);
     if (points == null) {
       return;
     }
     var dx = points[0] - points[2];
     var dy = points[1] - points[3];
     var dis = Math.sqrt(dx * dx + dy * dy);
     var steps = dis / 14;
     for (var i = 0; i < steps; i ++) {
       var x = points[2] + 14 * i * dx / dis - 2.5;
       var y = points[3] + 14 * i * dy / dis - 2.5;
       ctx.fillRect(x, y, 5, 5);
     }
   }

   function getFlexBezuer(p0, p1, p2, p3) {
     var a = -p0 + 3 * p1 - 3 * p2 + p3;
     var b2_4ac = p1 * p1 + p2 * p2 + p0 * p3 - p1 * p2 - p0 * p2 - p1 * p3;
     var b = p0 - 2 * p1 + p2;
     if (a == 0) {
       if (b == 0) {
         return null;
       }
       var t = (p0 - p1) / (2 * b);
       return [t, t];
     }
     if (b2_4ac < 0) {
       return null;
     } else {
       var b2_4ac_q = Math.sqrt(b2_4ac);
       var t1 = (-b + b2_4ac_q) / a;
       var t2 = (-b - b2_4ac_q) / a;
       if (t1 < 0 || t1 > 1) {
         t1 = t2;
       }
       if (t2 >= 0 && t2 <= 1) {
         return [t1, t2];
       } else {
         if (t1 === t2) {
           return null;
         } else {
           return [t1, t1];
         }
       }
     }
   }

   function getTBezuerDivide(p0, p1, p2, p3, pt0, pt1, maxDistance) {
     var ts = getFlexBezuer(p0, p1, p2, p3);
     if (ts == null) {
       return getTBezuer(p0, p1, p2, p3, pt0, pt1, 0, 1, maxDistance);
     } else {
       if (ts[1] < ts[0]) {
         var tmp = ts[1];
         ts[1] = ts[0];
         ts[0] = tmp;
       }
       var t1 = getTBezuer(p0, p1, p2, p3, pt0, pt1, 0, ts[0], maxDistance);
       var t2 = getTBezuer(p0, p1, p2, p3, pt0, pt1, ts[0], ts[1], maxDistance);
       var t3 = getTBezuer(p0, p1, p2, p3, pt0, pt1, ts[1], 1, maxDistance);
       var st = null;
       var et = null;
       if (t1 != null) {
         st = t1[0];
         et = t1[1];
       }
       if (t2 != null) {
         if (st == null) {
           st = t2[0];
         }
         if (t2[1] != null) {
           et = t2[1];
         }
       }
       if (t3 != null) {
         if (st == null) {
           st = t3[0];
         }
         if (t3[1] != null) {
           et = t3[1];
         }
       }
       if (st == null || et == null) {
         return null;
       }
       return [st, et];
     }
   }

   function getCrossBezuer(p0, p1, p2, p3, st, et, pt0, pt1) {
     var ot = st;
     var pot = getBtBezuer(p0, p1, p2, p3, st);
     var dt = (et - st) / 10;
     for (var i = 1; i <= 10; i++) {
       var ct = st + i * dt;
       var pct = getBtBezuer(p0, p1, p2, p3, ct);
       var pt = null;
       if (pt0 != null && ((pct > pt0 && pt0 > pot) || (pct <= pt0 && pot >= pt0))) {
         pt = pt0;
       }
       if (pt1 != null && ((pct > pt1 && pt1 > pot) || (pct <= pt1 && pot >= pt1))) {
         if (pt == null || (pot <= pct && pt1 <= pt0) || (pot > pct && pt1 > pt0)) {
           pt = pt1;
         }
       }
       if (pt != null) {
         return [ot, ct, pt, pot, pct];
       }
       ot = ct;
       pot = pct;
     }
     return null;
   }

   function getTBezuer(p0, p1, p2, p3, pt0, pt1, st, et,  maxDistance) {
     var pst = getBtBezuer(p0, p1, p2, p3, st);
     var ts = st;
     var te = et;
     var pts = null;
     var pte = null;
     if (pst > pt0 && pst < pt1) {
       ts = st;
       pts = pst;
       te = getCrossBezuer(p0, p1, p2, p3, st, et, pt0, pt1);
       if (te != null) {
         pte = te[4];
         te = te[1];
       }
     } else if (pst < pt0 || pst > pt1) {
       ts = getCrossBezuer(p0, p1, p2, p3, st, et, pt0, pt1);
       if (ts == null) {
         return null;
       } else {
         if (ts[2] == pt0) {
           te = getCrossBezuer(p0, p1, p2, p3, ts[0], et, null, pt1);
         } else {
           te = getCrossBezuer(p0, p1, p2, p3, ts[0], et, pt0, null);
         }
         pts = ts[3];
         if (te != null) {
           pte = te[4];
           te = te[1];
         }
         ts = ts[0];
       }
     } else if (pst == pt0) {
       var pet = getBtBezuer(p0, p1, p2, p3, et);
       if (pet > pst) {
         ts = st;
         pts = pst;
         te = getCrossBezuer(p0, p1, p2, p3, st, et, pt0, pt1);
         if (te != null) {
           pte = te[4];
           te = te[1];
         }
       } else {
         return null;
       }
     } else {
       var pet = getBtBezuer(p0, p1, p2, p3, et);
       if (pet < pst) {
         ts = st;
         pts = pst;
         te = getCrossBezuer(p0,p1, p2, p3, st, et, pt0, pt1, true);
         if (te != null) {
           pte = te[4];
           te = te[1];
         }
       } else {
         return null;
       }
     }
     if (ts == null) {
       ts = st;
     }
     if (te == null) {
       te = et;
     }
     var dd = pts - pte > 0 ? pts - pte : pte - pts;
     if (dd > maxDistance && (ts > st || te < et)) {
       var result = getTBezuer(p0, p1, p2, p3, pt0, pt1, ts, te, maxDistance);
       if (result != null) {
         return result;
       }
     }
     return [ts, te];
   }

   function getBtBezuer(p0, p1, p2, p3, t) {
     return (1-t)*(1-t)*(1-t)*p0 + 3*(1-t)*(1-t)*t*p1 + 3*t*t*(1-t)*p2 + t*t*t*p3;
   }

   function getVerticalMarginPosition(basePoint, referPoint, width, isReserveOrder, tg) {
     if (isReserveOrder) {
       width = -width;
     }
     if (typeof tg == "undefined" || tg == null) {
       tg = 1;
     }
     var bp = basePoint;
     var rp = referPoint;

     var dx = bp.x - rp.x;
     var dy = bp.y - rp.y;

     var x = parseInt(Math.sqrt(dx * dx + dy * dy));

     var coeff = width / x;

     var result = {
       left: null,
       right: null
     };

     result.left = new GPoint(bp.x - coeff * (tg * dy - dx), bp.y + coeff * (dy + tg * dx));
     result.right = new GPoint(bp.x + coeff * (dx + tg * dy), bp.y + coeff * (dy - tg * dx));

     return result;
   }

   function getPointOfLine(ps, p1, p2, pe, sw, ew) {
     var ds1x = p1.x - ps.x;
     var ds1y = p1.y - ps.y;

     var d12x = p2.x - p1.x;
     var d12y = p2.y - p1.y;

     var d2ex = pe.x - p2.x;
     var d2ey = pe.y - p2.y;

     var ds1 = Math.sqrt(ds1x * ds1x + ds1y * ds1y);
     var d12 = Math.sqrt(d12x * d12x + d12y * d12y);
     var d2e = Math.sqrt(d2ex * d2ex + d2ey * d2ey);

     var d1 = ((ew - sw) * ds1 / (ds1 + d12 + d2e) + sw);
     var d2 = ((ew - sw) * (ds1 + d12) / (ds1 + d12 + d2e) + sw);

     var coeff1 = d1 / ds1;
     var coeff2 = d2 / d2e;

     return [
       {
         x: p1.x - coeff1 * ds1y,
         y: p1.y + coeff1 * ds1x
       },
       {
         x: p1.x + coeff1 * ds1y,
         y: p1.y - coeff1 * ds1x
       },
       {
         x: p2.x - coeff2 * d2ey,
         y: p2.y + coeff2 * d2ex
       },
       {
         x: p2.x + coeff2 * d2ey,
         y: p2.y - coeff2 * d2ex
       }
     ];
   }

   function getRect(points, margin) {
     margin = typeof margin == "undefined" ? 0 : margin;
     var max = {
       x: points[0].x,
       y: points[0].y
     };
     var min  = {
       x: points[0].x,
       y: points[0].y
     };
     for (var i = 1; i < points.length; i++) {
       max.x = max.x < points[i].x ? points[i].x : max.x;
       max.y = max.y < points[i].y ? points[i].y : max.y;
       min.x = min.x > points[i].x ? points[i].x : min.x;
       min.y = min.y > points[i].y ? points[i].y : min.y;
     }

     return {
       x: min.x - margin,
       y: min.y - margin,
       width: max.x - min.x + 2 * margin,
       height: max.y - min.y + 2 * margin
     };
   }

   function getMapRect(map) {
     var container = map.getContainer();
     var zero = map.fromLatLngToDivPixel(map.fromContainerPixelToLatLng(new GPoint(0, 0)));
     var width = container.offsetWidth;
     var height = container.offsetHeight;
     return {
       x: zero.x - width,
       y: zero.y - height,
       width: 3 * width,
       height: 3 * height
     };
   }

   var Canvas = function() {
     this.pos_ = null;
   };

   Canvas.prototype = new GOverlay();

   Canvas.prototype.initialize = function(map) {
     this.map_ = map;
     var canvas = document.createElement("canvas");
     canvas.style.position = "absolute";
     if (this.pos_ == null) {
       this.pos_ = map.fromContainerPixelToLatLng(new GPoint(0, 0));

     }
     var pos = map.fromLatLngToDivPixel(this.pos_);
     canvas.style.left = pos.x + "px";
     canvas.style.top = pos.y + "px";
     map.getPane(G_MAP_MAP_PANE).appendChild(canvas);
     if (typeof canvas.getContext == "undefined") {
       canvas = G_vmlCanvasManager.initElement(canvas);
     }

     this.canvas_ = canvas;
     var obj = this;
     GEvent.addListener(this.map_, "moveend", function() {
                          obj.draw();
                        });
   };

   Canvas.prototype.draw = function() {

   };

   Canvas.prototype.remove = function() {
     this.canvas_.parentNode.removeChild(this.canvas_);
   };

   Canvas.prototype.copy = function() {
     return new Canvas();
   };

   Canvas.prototype.redraw = function(force) {
     if (force === true) {
       //this.draw();
     }
   };

   var moveProperty = {
     curArrow: null,
     curPoint: null,
     curMousePos: null
   };

   function mouseMove(evt) {
     evt = evt || window.event;
     window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
     var mp = moveProperty;
     var ca = mp.curArrow;
     if (mp.curArrow == null || mp.curPoint == null) {
       return;
     }
     var dx = evt.clientX - mp.curMousePos.x;
     var dy = evt.clientY - mp.curMousePos.y;
     mp.curMousePos.x = evt.clientX;
     mp.curMousePos.y = evt.clientY;
     var curLL = null;
     switch (mp.curPoint) {
     case 0:
       curLL = ca.fromLL_;
       break;
     case 1:
       curLL = ca.p1_;
       break;
     case 2:
       curLL = ca.p2_;
       break;
     case 3:
       curLL = ca.toLL_;
     };
     var curXY = ca.map_.fromLatLngToDivPixel(curLL);
     curXY.x = curXY.x + dx;
     curXY.y = curXY.y + dy;
     curLL = ca.map_.fromDivPixelToLatLng(curXY);
     ca.setKeyPoint(mp.curPoint, curLL);
   }
   function getMouseDownFn(arrow, point) {
     return function(evt) {
       evt = evt || window.event;
       if (evt.stopPropagation) {
         evt.stopPropagation();
       } else {
         evt.cancelBubble = true;
       }
       if (evt.preventDefault) {
         evt.preventDefault();
       } else {
         evt.returnValue = false;
       }

       var mp = moveProperty;
       mp.curArrow = arrow;
       mp.curPoint = point;
       mp.curMousePos = {
         x: evt.clientX,
         y: evt.clientY
       };
     };
   }

   var CArrow = function(pfrom, pto, p1, p2, options) {
     this.fromLL_ = pfrom;
     this.toLL_ = pto;
     this.p1_ = p1;
     this.p2_ = p2;
     this.enableEdit_ = false;
     this.color_ = "#0000FF";
     this.opacity_ = 1;
     this.straight_ = false;
     this.width_ = 10;
     if (typeof options != "undefined" && options != null) {
       if (typeof options.enableEdit != "undefined" && options.enableEdit != null) {
         this.enableEdit_ = true;
       }
       if (typeof options.color != "undefined" && options.color != null) {
         this.color_ = options.color;
       }
       if (typeof options.opacity != "undefined" && options.opacity != null) {
         this.opacity_ = options.opacity;
       }
       if (typeof options.straight != "undefined" && options.straight != null) {
         this.straight_ = options.straight;
       }
       if (typeof options.width != "undefined" && options.width != null) {
         this.width_ = options.width;
       }
     }
   };

   CArrow.prototype = new Canvas();

   CArrow.prototype.setKeyPoint = function(point, latlng) {
     switch (point) {
     case 0:
       this.fromLL_ = latlng;
       break;
     case 1:
       this.p1_ = latlng;
       break;
     case 2:
       this.p2_ = latlng;
       break;
     case 3:
       this.toLL_ = latlng;
       break;
     }
     this.draw();
   };

   CArrow.prototype.draw = function() {
     if (typeof this.map_ == "undefined" || this.map_ == null) {
       return;
     }
     if ((typeof this.editPanel_ == "undefined" || this.editPanel_ == null) && this.enableEdit_) {
       this.editPanel_ = document.createElement("div");
       this.map_.getPane(G_MAP_MAP_PANE).appendChild(this.editPanel_);
       this.editpf_ = document.createElement("div");
       this.editpf_.style.cssText = "border:1px solid " + this.color_ + ";width:9px;height:9px;"
         + "position:absolute;background:white;cursor:pointer;opacity:0.3;filter:alpha(opacity=30);"
         + "font-size:0;line-height:0;z-index:2;";
       this.editpt_ = this.editpf_.cloneNode(false);
       this.editPanel_.appendChild(this.editpf_);
       if (!this.straight_) {
         this.editp1_ = this.editpf_.cloneNode(false);
         this.editp2_ = this.editpf_.cloneNode(false);
         this.editPanel_.appendChild(this.editp1_);
         this.editPanel_.appendChild(this.editp2_);
       }
       this.editPanel_.appendChild(this.editpt_);


       GEvent.addDomListener(document, "mousemove", mouseMove);
       GEvent.addDomListener(document, "mouseup", function() {
                               moveProperty.curArrow = null;
                               moveProperty.curPoint = null;
                             });
     }

     var sWidth = 0.6;
     var map = this.map_;

     var pf = map.fromLatLngToDivPixel(this.fromLL_);
     var pt = map.fromLatLngToDivPixel(this.toLL_);
     var p1 = null;
     var p2 = null;

     if (typeof this.p1_ == "undefined" || this.p1_ == null || this.straight_) {
       p1 = new GPoint(pf.x + parseInt((pt.x - pf.x) / 3), pf.y + parseInt((pt.y - pf.y) / 3) - 50);
       this.p1_ = map.fromDivPixelToLatLng(p1);
     } else {
       p1 = map.fromLatLngToDivPixel(this.p1_);
     }
     if (typeof this.p2_ == "undefined" || this.p2_ == null || this.straight_) {
       p2 = new GPoint(pf.x + parseInt(2 * (pt.x - pf.x) / 3), pf.y + parseInt(2 * (pt.y - pf.y) / 3) - 50);
       this.p2_ = map.fromDivPixelToLatLng(p2);
     } else {
       p2 = map.fromLatLngToDivPixel(this.p2_);
     }

     var canvasRect = getRect([pf, pt, p1, p2], this.width_ * 2);

     var mapRect = getMapRect(map);
     if (canvasRect.x + canvasRect.width < mapRect.x || canvasRect.y + canvasRect.height < mapRect.y ||
         mapRect.x + mapRect.width < canvasRect.x || mapRect.y + mapRect.height < canvasRect.y) {
       this.canvas_.style.display = "none";
       if (this.enableEdit_) {
         this.editp1_.style.display = "none";
         this.editp1_.style.top = "none";
         this.editp2_.style.left = "none";
         this.editp2_.style.top = "none";
       }
       return;
     } else {
       this.canvas_.style.display = "";
       if (this.enableEdit_) {
         this.editp1_.style.display = "";
         this.editp1_.style.display = "";
         this.editp2_.style.display = "";
         this.editp2_.style.display = "";
       }
     }

     // get canvas rect.
     var canvasRectX = canvasRect.x + canvasRect.width;
     var mapRectX = mapRect.x + mapRect.width;
     var minX = canvasRectX < mapRectX ? canvasRectX : mapRectX;
     if (canvasRect.x < mapRect.x) {
       canvasRect.x = mapRect.x;
     }
     canvasRect.width = minX - canvasRect.x;
     var canvasRectY = canvasRect.y + canvasRect.height;
     var mapRectY = mapRect.y + mapRect.height;
     var minY = canvasRectY < mapRectY ? canvasRectY : mapRectY;
     if (canvasRect.y < mapRect.y) {
       canvasRect.y = mapRect.y;
     }
     canvasRect.height = minY - canvasRect.y;

     // set canvas position and size.
     this.canvas_.style.left = canvasRect.x + "px";
     this.canvas_.style.top = canvasRect.y + "px";
     this.canvas_.width = canvasRect.width;
     this.canvas_.height = canvasRect.height;

     pf = {
       x: pf.x - canvasRect.x,
       y: pf.y - canvasRect.y
     };
     p1 = {
       x: p1.x - canvasRect.x,
       y: p1.y - canvasRect.y
     };
     p2 = {
       x: p2.x - canvasRect.x,
       y: p2.y - canvasRect.y
     };
     pt = {
       x: pt.x - canvasRect.x,
       y: pt.y - canvasRect.y
     };

     var sPos = getVerticalMarginPosition(pf, p1, sWidth);
     var ePos = getVerticalMarginPosition(pt, p2, this.width_, true);

     var linePos = getPointOfLine(pf, p1, p2, pt, sWidth, this.width_);


     var se = getTBezuerDivide(pf.x, p1.x, p2.x, pt.x, 0, canvasRect.width, 5000);
     /*if (se != null) {
       GLog.write("start: " + se[0] + ", end: " + se[1]);
     } else {
       GLog.write("null");
     }*/
     var se2 = getTBezuerDivide(pf.y, p1.y, p2.y, pt.y, 0, canvasRect.height, 5000);
     /*if (se != null) {
       GLog.write("start: " + se[0] + ", end: " + se[1]);
     } else {
       GLog.write("null");
     }*/
//     GLog.write(se[0] + "," + se[1] + "," + se2[0] + "," + se2[1]);
     var maxs = null;
     var mine = null;
     var ctx = this.canvas_.getContext("2d");
     if (se != null) {
       maxs = se[0];
       mine = se[1];
       if (se2 != null) {
         if (maxs < se2[0]) {
           maxs = se2[0];
         }
         if (mine > se2[1]) {
           mine = se2[1];
         }
       }
     } else if (se2 != null) {
       maxs = se2[0];
       mine = se2[1];
     }
     if (mine != null && maxs != null) {
       if (mine < maxs) {
         var tmp = mine;
         mine = maxs;
         maxs = tmp;
       }
       var bezuerX = getDivideBezuer(pf.x, p1.x, p2.x, pt.x, maxs, mine);
       var bezuerY = getDivideBezuer(pf.y, p1.y, p2.y, pt.y, maxs, mine);

       var minWid = this.width_ - (this.width_ - sWidth) * (1 - maxs);
       var maxWid = this.width_ + (this.width_ - sWidth) * (1 - mine);


       var pfo = {
         x: pf.x,
         y: pf.y
       };
       var p1o = {
         x: p1.x,
         y: p1.y
       };
       var p2o = {
         x: p2.x,
         y: p2.y
       };
       var pto = {
         x: pt.x,
         y: pt.y
       };


       pf.x = bezuerX[0];
       pf.y = bezuerY[0];

       p1.x = bezuerX[1];
       p1.y = bezuerY[1];

       p2.x = bezuerX[2];
       p2.y = bezuerY[2];

       pt.x = bezuerX[3];
       pt.y = bezuerY[3];

       linePos = getPointOfLine(pf, p1, p2, pt, minWid, maxWid);

       sPos = getVerticalMarginPosition(pf, p1, minWid);
       ePos = getVerticalMarginPosition(pt, p2, maxWid, true);
       ctx.fillStyle = getRGB(this.color_, true, this.opacity_);
       ctx.beginPath();
       try {
         ctx.moveTo(sPos.right.x, sPos.right.y);
       }
       catch (e) {
         GLog.write(maxs + ", " + mine + ", " + pfo.x + ", " + pfo.y + ", " + p1o.x + ", " + p1o.y + ", " + p2o.x + ", " + p2o.y + ', ' + pto.x + ", " + pto.y);
       }

       ctx.bezierCurveTo(linePos[0].x, linePos[0].y, linePos[2].x, linePos[2].y, ePos.right.x, ePos.right.y);
       var aWidth = this.width_ + 5;
       if(document.all) {
         aWidth = this.width_ + 2;
         var arrPos = getVerticalMarginPosition(pt, p2, aWidth, true, 1.5);
         ctx.lineTo(arrPos.right.x, arrPos.right.y);
         ctx.lineTo(pt.x, pt.y);
         ctx.lineTo(arrPos.left.x, arrPos.left.y);
         ctx.lineTo(ePos.left.x, ePos.left.y);

         ctx.bezierCurveTo(linePos[3].x, linePos[3].y, linePos[1].x, linePos[1].y, sPos.left.x, sPos.left.y);
         ctx.lineTo(sPos.left.x, sPos.left.y);
       } else {

         var arrPos = getVerticalMarginPosition(pt, p2, aWidth, true, 1.2);
         ctx.lineTo(ePos.left.x, ePos.left.y);
         ctx.bezierCurveTo(linePos[3].x, linePos[3].y, linePos[1].x, linePos[1].y, sPos.left.x, sPos.left.y);
         ctx.lineTo(sPos.right.x, sPos.right.y);

         ctx.moveTo(pt.x, pt.y);
         ctx.lineTo(arrPos.left.x, arrPos.left.y);
         ctx.bezierCurveTo(ePos.left.x, ePos.left.y, ePos.right.x, ePos.right.y, arrPos.right.x, arrPos.right.y);
         ctx.lineTo(pt.x, pt.y);
       }
       ctx.fill();
     }

     /*ctx.beginPath();
     ctx.moveTo(bezuerX[0], bezuerY[0]);
     ctx.bezierCurveTo(bezuerX[1], bezuerY[1], bezuerX[2], bezuerY[2], bezuerX[3], bezuerY[3]);
     ctx.stroke();*/

     //GLog.write("se: " + se[0] + ", " + se[1] + "," + se2[0] + "," + se2[1]);

     if(this.enableEdit_) {
       this.editPanel_.style.cssText = "position:absolute;width:" + canvasRect.width + "px;height:" + canvasRect.height + "px;left:" + canvasRect.x + "px;top:" + canvasRect.y + "px;";
       this.editpf_.style.left = (pfo.x - 5) + "px";
       this.editpf_.style.top = (pfo.y - 5) + "px";
       var arrowThis = this;
       if (!this.straight_) {
         this.editp1_.style.left = (p1o.x - 5) + "px";
         this.editp1_.style.top = (p1o.y - 5) + "px";
         this.editp2_.style.left = (p2o.x - 5) + "px";
         this.editp2_.style.top = (p2o.y - 5) + "px";

         GEvent.addDomListener(this.editp1_, "mousedown", getMouseDownFn(arrowThis, 1));
         GEvent.addDomListener(this.editp2_, "mousedown", getMouseDownFn(arrowThis, 2));
         GEvent.addDomListener(this.editp1_, "mouseover", function() {
                                 arrowThis.editp1_.style.backgroundColor = arrowThis.color_;
                               });
         GEvent.addDomListener(this.editp1_, "mouseout", function() {
                                 arrowThis.editp1_.style.backgroundColor = "white";
                               });
         GEvent.addDomListener(this.editp2_, "mouseover", function() {
                                 arrowThis.editp2_.style.backgroundColor = arrowThis.color_;
                               });
         GEvent.addDomListener(this.editp2_, "mouseout", function() {
                                 arrowThis.editp2_.style.backgroundColor = "white";
                               });
       }
       this.editpt_.style.left = (pto.x - 5) + "px";
       this.editpt_.style.top = (pto.y - 5) + "px";


       GEvent.addDomListener(this.editpf_, "mousedown", getMouseDownFn(arrowThis, 0));
       GEvent.addDomListener(this.editpt_, "mousedown", getMouseDownFn(arrowThis, 3));
       GEvent.addDomListener(this.editpf_, "mouseover", function() {
                               arrowThis.editpf_.style.backgroundColor = arrowThis.color_;
                             });
       GEvent.addDomListener(this.editpf_, "mouseout", function() {
                               arrowThis.editpf_.style.backgroundColor = "white";
                             });

       GEvent.addDomListener(this.editpt_, "mouseover", function() {
                               arrowThis.editpt_.style.backgroundColor = arrowThis.color_;
                             });
       GEvent.addDomListener(this.editpt_, "mouseout", function() {
                               arrowThis.editpt_.style.backgroundColor = "white";
                             });

       ctx.fillStyle = getRGB(this.color_, true, 0.6);
       ctx.beginPath();
       //drawDotLine(pfo.x, pfo.y, p1o.x, p1o.y, ctx, canvasRect);
       //drawDotLine(p1o.x, p1o.y, p2o.x, p2o.y, ctx, canvasRect);
       //drawDotLine(p2o.x, p2o.y, pto.x, pto.y, ctx, canvasRect);
       ctx.stroke();
     }
   };

   window._CArrow = CArrow || window._CArrow;
 })();
