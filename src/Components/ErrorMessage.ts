import './ErrorMessage.css';

class ErrorMessage {
  errorElem: HTMLElement | null;

  constructor(public message: string) {
    this.errorElem = null;

    this.render();
  }

  delete() {
    this.errorElem = document.querySelector('.ErrorMessage');
    const existingErrorMsg = document.body.querySelector('.ErrorMessage');
    if (existingErrorMsg) {
      document.body.removeChild(existingErrorMsg);
    }
    this.errorElem = null;
  }

  render() {
    this.delete();
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('ErrorMessage');
    errorDiv.setAttribute('aria-live', 'polite');
    errorDiv.innerText = this.message;
    document.body.appendChild(errorDiv);
    this.errorElem = errorDiv;
  }
}

export default ErrorMessage;
