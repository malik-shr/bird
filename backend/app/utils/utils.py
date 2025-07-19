from fastapi import HTTPException
from sqlalchemy import Integer, String, Float, Boolean, Table, or_, and_, not_
from typing import List

SQLALCHEMY_TYPE_MAP = {
    "Integer": Integer,
    "String": String,
    "Float": Float,
    "Boolean": Boolean,
}

def validate_columns(table: Table, columns: List[str]):
    invalid_columns = [col for col in columns if col not in table.c]
    if invalid_columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid columns: {', '.join(invalid_columns)}"
        )

def parse_filter_expression(filter_expr: str, table: Table):
    """Parse a filter expression with &&/|| operators into SQLAlchemy conditions"""
    
    def parse_condition(condition_str: str):
        """Parse a single condition like 'age>18' or 'name~'abc'' """
        condition_str = condition_str.strip()
        
        # Define operators in order of precedence (longest first to avoid conflicts)
        operators = ['>=', '<=', '!=', '>', '<', '=', '~']
        
        field = None
        operator = None
        value = None
        
        for op in operators:
            if op in condition_str:
                parts = condition_str.split(op, 1)
                if len(parts) == 2:
                    field = parts[0].strip()
                    operator = op
                    value = parts[1].strip()
                    break
        
        if not field or not operator or value is None:
            raise ValueError(f"Invalid condition format: {condition_str}")
        
        # Remove quotes from value if present
        if value.startswith("'") and value.endswith("'"):
            value = value[1:-1]
        elif value.startswith('"') and value.endswith('"'):
            value = value[1:-1]
        
        if field not in table.c:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid field: {field}"
            )
        
        column = table.c[field]
        
        if operator == "=":
            return column == value
        elif operator == "!=":
            return column != value
        elif operator == ">":
            return column > value
        elif operator == "<":
            return column < value
        elif operator == ">=":
            return column >= value
        elif operator == "<=":
            return column <= value
        elif operator == "~":
            return column.like(f"%{value}%")
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid operator: {operator}. Use: =, !=, >, <, >=, <=, ~"
            )
    
    def parse_expression(expr: str):
        """Parse complex expressions with &&/||/! and parentheses"""
        expr = expr.strip()
        
        # Handle parentheses
        if expr.startswith('(') and expr.endswith(')'):
            return parse_expression(expr[1:-1])
        
        # Handle NOT operator (!)
        if expr.startswith('!'):
            return not_(parse_expression(expr[1:]))
        
        # Find OR operators (||) - lower precedence
        or_parts = []
        paren_depth = 0
        current_part = ""
        i = 0
        
        while i < len(expr):
            char = expr[i]
            if char == '(':
                paren_depth += 1
                current_part += char
            elif char == ')':
                paren_depth -= 1
                current_part += char
            elif paren_depth == 0 and i < len(expr) - 1 and expr[i:i+2] == '||':
                or_parts.append(current_part.strip())
                current_part = ""
                i += 2
                continue
            else:
                current_part += char
            i += 1
        
        or_parts.append(current_part.strip())
        
        if len(or_parts) > 1:
            # Handle OR logic
            conditions = []
            for part in or_parts:
                conditions.append(parse_expression(part))
            return or_(*conditions)
        
        # Find AND operators (&&) - higher precedence
        and_parts = []
        paren_depth = 0
        current_part = ""
        i = 0
        
        while i < len(expr):
            char = expr[i]
            if char == '(':
                paren_depth += 1
                current_part += char
            elif char == ')':
                paren_depth -= 1
                current_part += char
            elif paren_depth == 0 and i < len(expr) - 1 and expr[i:i+2] == '&&':
                and_parts.append(current_part.strip())
                current_part = ""
                i += 2
                continue
            else:
                current_part += char
            i += 1
        
        and_parts.append(current_part.strip())
        
        if len(and_parts) > 1:
            # Handle AND logic
            conditions = []
            for part in and_parts:
                conditions.append(parse_expression(part))
            return and_(*conditions)
        
        # If no &&/|| found, it's a simple condition
        return parse_condition(expr)
    
    try:
        return parse_expression(filter_expr)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid filter expression: {str(e)}")

