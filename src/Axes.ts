import * as Component from "@egjs/component";
import {AxesOption} from "./AxesOption";
import {AnimationManager} from "./AnimationManager";
import {EventManager} from "./EventManager";
import {InterruptManager} from "./InterruptManager";
import {AxisManager, Axis} from "./AxisManager";
import {InputObserver} from "./InputObserver";
import {PanInput} from "./inputType/PanInput";
import {PinchInput} from "./inputType/PinchInput";
import {TRANSFORM, DIRECTION} from "./const";
import {IInputType} from "./inputType/InputType";

/**
 * Copyright (c) NAVER Corp.
 * egjs-axes projects are licensed under the MIT license
 */
/**
 * A module used to change the information of user action entered by various input devices such as touch screen or mouse into logical coordinates within the virtual coordinate system. The coordinate information sorted by time events occurred is provided if animations are made by user actions.
 * @alias eg.Axes
 * @extends eg.Component
 *
 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
 */
export default class Axes extends Component {
	static PanInput = PanInput;
	static PinchInput = PinchInput;
	static TRANSFORM = TRANSFORM;
	static DIRECTION_ALL = DIRECTION.DIRECTION_ALL;
	static DIRECTION_DOWN = DIRECTION.DIRECTION_DOWN;
	static DIRECTION_HORIZONTAL = DIRECTION.DIRECTION_HORIZONTAL;
	static DIRECTION_LEFT = DIRECTION.DIRECTION_LEFT;
	static DIRECTION_NONE = DIRECTION.DIRECTION_NONE;
	static DIRECTION_RIGHT = DIRECTION.DIRECTION_RIGHT;
	static DIRECTION_UP = DIRECTION.DIRECTION_UP;
	static DIRECTION_VERTICAL = DIRECTION.DIRECTION_VERTICAL;

	options: AxesOption;
	private _em: EventManager;
	private _axm: AxisManager;
	private _itm: InterruptManager;
	private _am: AnimationManager;
	private _io: InputObserver;
	private _inputs: IInputType[] = [];

	constructor(options: AxesOption) {
		super();
		this.options = { ...{
			easing: function easeOutCubic(x) {
				return 1 - Math.pow(1 - x, 3);
			},
			interruptable: true,
			maximumDuration: Infinity,
			deceleration: 0.0006,
			axis: {},
		}, ...options};

		this._complementOptions();
		this._em = new EventManager(this);
		this._axm = new AxisManager(this.options);
		this._itm = new InterruptManager(this.options);
		this._am = new AnimationManager(this.options, this._itm, this._em, this._axm);
		this._io = new InputObserver(this.options, this._itm, this._em, this._axm, this._am);
	}

	/**
	 * set up 'css' expression
	 * @private
	 */
	private _complementOptions() {
		Object.keys(this.options.axis).forEach(axis => {
			this.options.axis[axis] = { ...{
				range: [0, 100],
				bounce: [0, 0],
				circular: [false, false]
			}, ...this.options.axis[axis]};

			["bounce", "circular"].forEach(v => {
				const axisOption = this.options.axis;
				const key = axisOption[axis][v];

				if (/string|number|boolean/.test(typeof key)) {
					axisOption[axis][v] = [key, key];
				}
			});
		});
	}

	connect(axes: string[] | string, inputType: IInputType) {
		let mapped;
		if (typeof axes === "string") {
			mapped = axes.split(" ");
		} else {
			mapped = axes.concat();
		}

		// check same instance
		if (~this._inputs.indexOf(inputType)) {
			this.disconnect(inputType);
		}

		// check same element in hammer type for share
		const targets = this._inputs.filter(v => v.hammer && v.element === inputType.element);
		if (targets.length) {
			inputType.hammer = targets[0].hammer;
		}
		inputType.mapAxes(mapped);
		inputType.connect(this._io);
		this._inputs.push(inputType);
		return this;
	}

	disconnect(inputType?: IInputType) {
		if (inputType) {
			const index = this._inputs.indexOf(inputType);
			this._inputs[index].disconnect();
			~index && this._inputs.splice(index, 1);
		} else {
			this._inputs.forEach(v => v.disconnect());
			this._inputs = [];
		}
		return this;
	}

	get(axes?: string[]) {
		return this._axm.get(axes);
	}

	setTo(pos: Axis, duration = 0) {
		this._am.setTo(pos, duration);
		return this;
	}

	setBy(pos: Axis, duration = 0) {
		this._am.setBy(pos, duration);
		return this;
	}

	isOutside(axes?: string[]) {
		return this._axm.isOutside(axes);
	}

	destroy() {
		this.disconnect();
		this._em.destroy();
	}
};
