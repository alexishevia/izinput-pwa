import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { actions as txActions } from '../../redux/transactions';
import { actions as errActions } from '../../redux/errors';
import {
  transactions as transactionsSlice,
  categories as categoriesSlice
} from 'izreducer';
import { dateToDayStr, isValidDayStr } from '../../helpers/date';

const { TYPES: transactionTypes, CASH_FLOW } = transactionsSlice;

function today() {
  return dateToDayStr(new Date());
}

function preventDefault(evt) {
  evt.preventDefault();
  return false;
}

const initialState = () => ({
  amount: '',
  category: '',
  description: '',
  type: transactionTypes.CASH,
  cashFlow: CASH_FLOW.EXPENSE,
  transactionDate: today()
});

class NewTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();
  }

  save(evt) {
    preventDefault(evt);
    const {
      amount,
      category,
      description,
      type,
      transactionDate,
      cashFlow
    } = this.state;
    const { onAdd, newError } = this.props;
    const amountAsFloat = parseFloat(amount, 10);
    if (amountAsFloat === 0 || Number.isNaN(amountAsFloat)) {
      newError("Amount must be a number bigger than 0.")
      return;
    }
    onAdd({
      amount: amountAsFloat,
      category,
      description,
      type: type || Object.values(transactionTypes)[0],
      cashFlow: cashFlow || Object.values(CASH_FLOW)[0],
      transactionDate: isValidDayStr(transactionDate)
        ? transactionDate
        : today()
    });
    this.setState(initialState());
  }

  render() {
    const { amount, category, description, type, transactionDate } = this.state;
    const { categories } = this.props;
    const categoryOptions = ['', ...categories].map(cat => ({
      key: cat,
      text: cat,
      value: cat
    }));
    return (
          <Form onSubmit={preventDefault}>
            <Form.Group style={{ justifyContent: 'center' }}>
              <Form.Input
                width={4}
                label="Amount"
                placeholder="Amount"
                type="text"
                icon="dollar"
                iconPosition="left"
                value={amount}
                onChange={evt => this.setState({ amount: evt.target.value })}
              />
              <Form.Input
                width={4}
                type="date"
                label="Date"
                icon="calendar"
                iconPosition="left"
                value={transactionDate}
                onChange={evt =>
                  this.setState({ transactionDate: evt.target.value })
                }
              />
            </Form.Group>
            <Form.Group style={{ justifyContent: 'center' }}>
              <Form.Select
                width={8}
                label="Category"
                placeholder="Category"
                options={categoryOptions}
                value={category}
                onChange={evt => {
                  this.setState({ category: evt.target.textContent });
                }}
              />
            </Form.Group>
            <Form.Group style={{ justifyContent: 'center' }}>
              <Form.Input
                width={8}
                type="text"
                label="Description"
                placeholder="Description"
                value={description}
                onChange={evt =>
                  this.setState({ description: evt.target.value })
                }
              />
            </Form.Group>
            <Form.Group inline style={{ justifyContent: 'center' }}>
              <label>Type</label>
              {[
                transactionTypes.CASH,
                transactionTypes.CREDIT,
                transactionTypes.TRANSFER
              ].map(txType => (
                <Form.Radio
                  style={{ textTransform: 'capitalize' }}
                  key={txType}
                  label={txType.toLowerCase()}
                  value={txType}
                  checked={type === txType}
                  onChange={evt => {
                    this.setState({ type: txType });
                  }}
                />
              ))}
            </Form.Group>
            <Form.Group style={{ justifyContent: 'center' }}>
              <Form.Button
                primary
                width={8}
                fluid
                onClick={evt => this.save(evt)}
              >
                <Icon name="dollar" />
                Add Expense
              </Form.Button>
            </Form.Group>
          </Form>
    );
  }
}

NewTransaction.propTypes = {
  // redux props
  onAdd: PropTypes.func.isRequired,
  newError: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  categories: categoriesSlice.selectors.sorted(state)
});

const mapDispatchToProps = dispatch => ({
  onAdd: tx => dispatch(txActions.put(tx)),
  newError: err => dispatch(errActions.add(err)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewTransaction);

