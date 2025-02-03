import json
import os
from typing import List
import openai
import requests

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')
    
with open("chatgptkey.txt", "r") as file:
    os.environ["OPENAI_API_KEY"] = file.read().strip()
    
with open("openrouterkey.txt", "r") as file:
    os.environ["OPENROUTER_API_KEY"] = file.read().strip()

def sign_in_to_business_domain_apis():
    """
    Helps authenticating with the Business Domain REST APIs and gets a JWT token.
    """
    url = "http://localhost:3000/auth/login"
    payload = {
        "userName": "spike",
        "password": "spike123"
    }
    
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        response_json = response.json()
        return response_json["token"]
    else:
        response.raise_for_status()
        
def call_bank_account_api(inputs):
    """
    Calls the REST API to create a bank account using the provided inputs.
    """
    headers = {"Authorization": f"Bearer {inputs['token']}"}
    payload = {
        "customerName": inputs['customerName'],
        "customerId": int(inputs['customerId']),
        "depositAmount": float(inputs['depositAmount']),
        "location": inputs['location'],
        "branchCode": inputs['branchCode']
    }
    
    response = requests.post("http://localhost:3000/savingsbankaccounts", headers=headers, json=payload)
    
    if response.status_code == 201:
        location_header = response.headers['Location']
        account_id = location_header.split('/')[-1]
        return account_id
    else:
        response.raise_for_status()

def call_home_loan_api(inputs):
    """
    Calls the REST API to create a home loan using the provided inputs.
    """
    headers = {"Authorization": f"Bearer {inputs['token']}"}
    payload = {
        "customerName": inputs['customerName'],
        "customerId": int(inputs['customerId']),
        "loanAmount": float(inputs['loanAmount']),
        "location": inputs['location'],
        "loanTenure": int(inputs['loanTenure'])
    }
    response = requests.post("http://localhost:3000/homeloans", headers=headers, json=payload)
    
    if response.status_code == 201:
        location_header = response.headers['Location']
        loan_id = location_header.split('/')[-1]
        return loan_id
    else:
        response.raise_for_status()

def user_wants_to_exit(user_input):
    """
    Asks Chat GPT API to decide if the user wants to exit the conversation.
    Returns True if the response is 'Quit', otherwise False.
    """
    exit_prompt = [
        {"role": "system", "content": "You are a chatbot assistant. Decide if the user intends to exit the conversation. If the user wants to exit the conversation, please specify 'Quit'."},
        {"role": "user", "content": user_input},
    ]
   
    response = openai.chat.completions.create(
        model = "gpt-4o-mini",
        messages = exit_prompt,
    )
    
    decision = response.choices[0].message.content.strip()
    return decision == "Quit"

def call_chat_gpt_api_for_next_conversation_question(context, tools):
    """
    Calls the Chat GPT API to generate a response based on the provided context.
    The context includes a predefined system message and the conversation so far.
    Returns the response object from the GPT API.
    """
    messages = [
        {"role": "system", "content": "You are a helpful banking agent. Identify whether the customer wants a Savings Bank Account or a Home Loan. Ask for missing mandatory fields one by one until you have all required details. Only then, make a function call."}
    ] + [{"role": "user", "content": msg} for msg in context]
    
    response = openai.chat.completions.create(
        model = "gpt-4o-mini",
        messages = messages,
        tools = tools,  # The functions that call the REST APIs to create the service records.
        tool_choice = "auto"  # Let GPT decide whether to call a function
    )

    return response

def present_user_with_record_creation_success (context, id, service_name):
    """
    Calls the Chat GPT API to generate a "successfully created" response message based on the provided context.
    The context includes a predefined system message and the conversation so far.
    """
    messages = [
        {"role": "system", "content": f"You are a helpful banking agent. A new {service_name} record has been created, and its ID is {id}. You can get the name of the customer from the `messages` collection. Prepare a nice message to tell the customer about the newly created record and its ID. An example would be: `I'm glad to tell you that we have created a new {service_name} for you. Here is the account ID: {id}`. Please your own style every time for the message." }
    ] + [{"role": "user", "content": msg} for msg in context]
    
    response = openai.chat.completions.create(
        model = "gpt-4o-mini",
        messages = messages
    )

    return response.choices[0].message.content.strip()

def main():
    """
    Main conversation loop for interacting with the chatbot.
    """
    clear_screen ()
    
    print("Signing in to APIs...")
    jwt_token = sign_in_to_business_domain_apis()

    print("Signed in successfully!\n")
    
    tools = [
        {
            "type": "function",
            "function": {
                "name": "call_bank_account_api",
                "description": "Creates a new savings bank account for the customer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customerName": {"type": "string", "description": "Full name of the customer"},
                        "customerId": {"type": "integer", "description": "Unique customer ID"},
                        "depositAmount": {"type": "number", "description": "Initial deposit amount"},
                        "location": {"type": "string", "description": "City where the account is opened"},
                        "branchCode": {"type": "string", "description": "Branch code of the bank"},
                    },
                    "required": ["customerName", "customerId", "depositAmount", "location", "branchCode"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "call_home_loan_api",
                "description": "Processes a home loan application for the customer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customerName": {"type": "string", "description": "Full name of the customer"},
                        "customerId": {"type": "integer", "description": "Unique customer ID"},
                        "loanAmount": {"type": "number", "description": "Requested loan amount"},
                        "location": {"type": "string", "description": "Location of the property"},
                        "loanTenure": {"type": "integer", "description": "Loan tenure in years"},
                    },
                    "required": ["customerName", "customerId", "loanAmount", "location", "loanTenure"]
                }
            }
        }
    ]    
    
    user_replies = []
    print("\nGreetings! I am Monitory Information Network Agent (MINA).\n\nHow may I assist you today?")
    
    while True:
        user_input = input("You: ")
        
        if user_wants_to_exit(user_input):
            print("\nMina: Thank you for visiting! Have a great day.")
            break
        
        user_replies.append(user_input)
        
        # With the updated context, call Chat GPT API.
        gpt_response = call_chat_gpt_api_for_next_conversation_question(user_replies, tools)
        
        if gpt_response.choices[0].message.tool_calls:
            # Chat GPT API response implies to make `Function Call`
            function_name = gpt_response.choices[0].message.tool_calls[0].function.name
            function_args = json.loads(gpt_response.choices[0].message.tool_calls[0].function.arguments)

            # Add JWT token to arguments collection.
            function_args["token"] = jwt_token
            
            if function_name == "call_bank_account_api":
                print(f"\nMina: I need a moment to create a new Savings Bank Account for you.")
                print(f"\nMina: Please wait ...\n")

                account_id = call_bank_account_api(function_args)

                message_to_user = present_user_with_record_creation_success (user_replies, account_id, "Savings Bank Account")
                print(f"Mina: {message_to_user}")
                print(f"\n---------------------------------------------------------------.")
            elif function_name == "call_home_loan_api":
                print(f"\nMina: I need a moment to issue new Home Loan for you.")
                print(f"\nMina: Please wait ...\n")
                
                loan_id = call_home_loan_api(function_args)
                
                message_to_user = present_user_with_record_creation_success (user_replies, loan_id, "Home Loan")
                print(f"Mina: {message_to_user}")
                print(f"\n---------------------------------------------------------------.")
            else:
                print("\nMina: Unknown function call!")
                continue
            
            # Reset replies for a new conversation
            user_replies = []
            print("\nMina: How may I assist you now?")
        else:
            message_from_gpt = gpt_response.choices[0].message.content.strip()

            user_replies.append(message_from_gpt)
            print(f"\nMina: {message_from_gpt}")

if __name__ == "__main__":
    main()