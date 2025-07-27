import Select from '../Select';
import { fieldIconMap } from '../../utils/utils';

type RuleData = {
  viewRule: number;
  createRule: number;
  updateRule: number;
  deleteRule: number;
};

type AuthRulesProps = {
  ruleData: RuleData;
  handleRuleChange: (e: any) => void;
};

const AuthRules = ({ ruleData, handleRuleChange }: AuthRulesProps) => {
  const options = [
    { value: 0, text: '@all' },
    { value: 1, text: '@user' },
    { value: 2, text: '@2' },
    { value: 3, text: '@3' },
    { value: 4, text: '@4' },
    { value: 5, text: '@5' },
    { value: 6, text: '@6' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Select
        id="viewRule"
        name="viewRule"
        value={ruleData.viewRule}
        label="View Rule"
        required={true}
        handleChange={handleRuleChange}
        disabled={false}
        options={options}
        icon={fieldIconMap['Select']}
      ></Select>
      <Select
        id="createRule"
        name="createRule"
        value={ruleData.createRule}
        label="Create Rule"
        required={true}
        handleChange={handleRuleChange}
        disabled={false}
        options={options}
        icon={fieldIconMap['Select']}
      ></Select>
      <Select
        id="updateRule"
        name="updateRule"
        value={ruleData.updateRule}
        label="Update Rule"
        required={true}
        handleChange={handleRuleChange}
        disabled={false}
        options={options}
        icon={fieldIconMap['Select']}
      ></Select>
      <Select
        id="deleteRule"
        name="deleteRule"
        value={ruleData.deleteRule}
        label="Delete Rule"
        required={true}
        handleChange={handleRuleChange}
        disabled={false}
        options={options}
        icon={fieldIconMap['Select']}
      ></Select>
    </div>
  );
};

export default AuthRules;
