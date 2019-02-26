# A simple program to create a formatted text file from a *.csv file.

# csv_file = input('Enter the name of your input file: ')
# txt_file = input('Enter the name of your output file: ')
csv_file = 'c_tot.csv'
txt_file = 'c_tot.txt'

try:
    my_input_file = open(txt_file, "r")
except IOError as e:
    print("I/O error({0}): {1}".format(e.errno, e.strerror))

if not my_input_file.closed:
    text_list = [];
    for line in my_input_file.readlines():
        line = line.split("\t", 2)
        text_list.append(",".join(line))
    my_input_file.close()

try:
    my_output_file = open(csv_file, "w")
except IOError as e:
    print("I/O error({0}): {1}".format(e.errno, e.strerror))

if not my_output_file.closed:
    for line in text_list:
        my_output_file.write(line)
    print('File Successfully written.')
    my_output_file.close()
