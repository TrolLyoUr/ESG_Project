import django

django.setup()
import time
from multiprocessing import cpu_count, Queue, Process

import os
from esg_app.models import Company
import pickle

from esg_app.calculations import calculate_all_framework_scores_all_years

cpu_count = cpu_count()
pcontrol = Queue(cpu_count * 4)
results = Queue()
processes = []


def calculate(com, pcount, sharelist):
    print("calculating...")
    result = calculate_all_framework_scores_all_years(com)
    print("submit result")
    sharelist.put({com.id: result})
    print(pcount.get())


if __name__ == '__main__':
    coms = Company.objects.all()
    print(f"cpu_count: {cpu_count}")
    for com in coms:
        while pcontrol.full():
            time.sleep(0.1)
        query = Process(target=calculate, args=(com, pcontrol, results))
        pcontrol.put(f"company: {com.id} finish")
        print(f"start com: {com.id}")
        query.start()
        processes.append(query)
    time.sleep(1)
    print("***********clear whole process*************")
    for p in processes:
        p.join()

    data = {}
    while not results.empty():
        for key, value in results.get().items():
            data[key] = value

    with open("result.pkl", "wb") as file:
        pickle.dump(data, file)

    with open("result.pkl", "rb") as file:
        d = pickle.load(file)

    print(d)
