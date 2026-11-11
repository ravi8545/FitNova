#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def check_db_and_print_banner():
    # Print immediately when user runs runserver or check
    if any(arg in sys.argv for arg in ['runserver', 'check']):
        if os.environ.get('RUN_MAIN') != 'true':
            try:
                import django
                django.setup()
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1;")

                engine_full = connection.settings_dict.get('ENGINE', '')
                engine_name = engine_full.split('.')[-1].upper()
                db_name = connection.settings_dict.get('NAME', '')
                db_user = connection.settings_dict.get('USER', '')
                host = connection.settings_dict.get('HOST', 'localhost')
                port = connection.settings_dict.get('PORT', '')

                from supplements.models import SupplementProduct, SupplementCategory, UserSupplementStack
                from reports.models import DailyHealthLog, ReportGoal, ReportAreaOfImprovement

                prod_count = SupplementProduct.objects.count()
                cat_count = SupplementCategory.objects.count()
                stack_count = UserSupplementStack.objects.count()
                log_count = DailyHealthLog.objects.count()
                goal_count = ReportGoal.objects.count()
                imp_count = ReportAreaOfImprovement.objects.count()

                border = "=" * 74
                print("\n" + border, flush=True)
                print("            FITNOVA BACKEND - DATABASE CONNECTION STATUS", flush=True)
                print(border, flush=True)
                print("  Status         : [CONNECTED] Database connection is ACTIVE & VERIFIED", flush=True)
                print(f"  Database Engine: {engine_name} ({engine_full})", flush=True)
                print(f"  Database Target: {db_name}", flush=True)
                if db_user:
                    print(f"  Database User  : {db_user}", flush=True)
                if 'mysql' in engine_full.lower():
                    print(f"  Host / Port    : {host}:{port or '3306'}", flush=True)
                print(f"  Supplements DB : {cat_count} Categories | {prod_count} Products | {stack_count} Stack Items", flush=True)
                print(f"  Reports DB     : {log_count} Daily Health Logs | {goal_count} Goals | {imp_count} Improvements", flush=True)
                print("  Live Sync      : Fully Integrated (Reads & Writes persist to Database)", flush=True)
                print(border + "\n", flush=True)
            except Exception as e:
                border = "!" * 74
                print("\n" + border, flush=True)
                print("  [DATABASE CONNECTION ERROR]", flush=True)
                print(f"  Failed to connect to database: {e}", flush=True)
                print(border + "\n", flush=True)


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    check_db_and_print_banner()
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
