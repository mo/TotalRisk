import { loadSvgIntoDiv } from './../helpers';

export default class InjectSVGDirective {
    constructor() {
        this.restrict = 'A';
    }

    link(scope, elem, attr) {
        const div = elem[0];
        loadSvgIntoDiv(attr.src, `#${div.id}`, () => {}, 1);
    }
}